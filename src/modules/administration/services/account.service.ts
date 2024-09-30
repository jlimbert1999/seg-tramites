import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  HttpException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import mongoose, { FilterQuery, Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

import { OfficerService } from './officer.service';
import { Account } from '../schemas';
import {
  CreateAccountDto,
  CreateOfficerDto,
  FilterAccountDto,
  UpdateAccountDto,
} from '../dtos';
import { User, UserDocument } from 'src/modules/users/schemas';
import { CreateUserDto } from 'src/modules/users/dtos';
import { UserService } from 'src/modules/users/services';

@Injectable()
export class AccountService {
  constructor(
    @InjectModel(Account.name) private accountModel: Model<Account>,

    // !Delete after update
    @InjectConnection() private connection: mongoose.Connection,
    private userService: UserService,
    private officerService: OfficerService,
  ) {}

  async repairColection() {
    // const accounts = await this.accountModel.find({}).populate({
    //   path: 'funcionario',
    //   populate: {
    //     path: 'cargo',
    //   },
    // });
    // for (const account of accounts) {
    //   let newJob = '';
    //   if (!account.funcionario) {
    //     newJob = 'SIN DESIGNAR';
    //   } else {
    //     if (!account.funcionario.cargo) {
    //       newJob = 'SIN DESIGNAR';
    //     } else {
    //       newJob = account.funcionario.cargo.nombre;
    //     }
    //   }
    //   await this.accountModel.updateOne(
    //     { _id: account._id },
    //     { jobtitle: newJob },
    //   );
    // }
  }

  async generate() {
    const accounts = await this.accountModel.find({}).populate('funcionario');
    for (const element of accounts) {
      const { login, password, updatedPassword, activo, rol } = element;
      const fullname = element.funcionario
        ? [
            element.funcionario.nombre,
            element.funcionario.paterno,
            element.funcionario.materno,
          ]
            .filter(Boolean)
            .join(' ')
        : 'Unknown';
      const user = new this.userModel({
        fullname,
        login,
        password,
        updatedPassword,
        isActive: activo,
        role: rol,
      });
      await user.save();
      if (!element.isRoot) {
        await this.accountModel.updateOne(
          { _id: element._id },
          { user: user._id },
        );
      } else {
        console.log('un usuario root', element);
      }
    }
  }

  async findAll({ dependency, limit, offset, term }: FilterAccountDto) {
    const regex = new RegExp(term, 'i');
    const query: FilterQuery<Account> = {
      ...(dependency && {
        dependencia: new mongoose.Types.ObjectId(dependency),
      }),
      ...(term && {
        $or: [
          { fullname: regex },
          { 'funcionario.dni': regex },
          { jobtitle: regex },
        ],
      }),
    };
    const data = await this.accountModel
      .aggregate()
      .lookup({
        from: 'funcionarios',
        localField: 'funcionario',
        foreignField: '_id',
        as: 'funcionario',
      })
      .unwind({
        path: '$funcionario',
        preserveNullAndEmptyArrays: true,
      })
      .addFields({
        fullname: {
          $concat: [
            { $ifNull: ['$funcionario.nombre', ''] },
            ' ',
            { $ifNull: ['$funcionario.paterno', ''] },
            ' ',
            { $ifNull: ['$funcionario.materno', ''] },
          ],
        },
      })
      .match(query)
      .sort({ _id: -1 })
      .facet({
        paginatedResults: [{ $skip: offset }, { $limit: limit }],
        totalCount: [
          {
            $count: 'count',
          },
        ],
      });
    const accounts = data[0].paginatedResults;
    await this.accountModel.populate(accounts, {
      path: 'dependencia',
      select: 'nombre',
    });
    const length = data[0].totalCount[0] ? data[0].totalCount[0].count : 0;
    return { accounts, length };
  }

  async create(
    accountDto: CreateAccountDto,
    officerDto: CreateOfficerDto,
    userDto: CreateUserDto,
  ) {
    const session = await this.connection.startSession();
    try {
      session.startTransaction();
      const user = await this.userService.create(userDto, session);
      const officer = await this.officerService.create(officerDto, session);

      const createdAccount = new this.accountModel({
        user: user._id,
        funcionario: officer._id,
      });
      await createdAccount.save({ session });
      await createdAccount.populate(this.populateOptions);
      await session.commitTransaction();
      return this.removePasswordField(createdAccount);
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Error al crear cuenta');
    } finally {
      session.endSession();
    }
  }

  async update(id: string, account: UpdateAccountDto) {
    const accountDB = await this.accountModel.findById(id);
    if (!accountDB) throw new NotFoundException(`La cuenta ${id} no existe`);
    if (accountDB.login !== account.login)
      await this.checkDuplicateLogin(account.login);
    if (account.password)
      account['password'] = this.encryptPassword(account.password);
    const updated = await this.accountModel
      .findByIdAndUpdate(id, account, { new: true })
      .populate(this.populateOptions);
    return this.removePasswordField(updated);
  }

  async assign(account: CreateAccountDto) {
    if (account.funcionario) {
      const duplicate = await this.accountModel.findOne({
        funcionario: account.funcionario,
      });
      if (duplicate)
        throw new BadRequestException(
          'El funcionario seleccionado ya esta asignado a una cuenta',
        );
    }
    await this.checkDuplicateLogin(account.login);
    const ecryptedPassword = this.encryptPassword(account.password);
    const createdAccount = new this.accountModel({
      ...account,
      password: ecryptedPassword,
    });
    await createdAccount.save();
    await createdAccount.populate(this.populateOptions);
    return this.removePasswordField(createdAccount);
  }

  async searchOfficersWithoutAccount(text: string) {
    return await this.officerService.searchOfficersWithoutAccount(text);
  }

  async getAccountsForSend(id_dependency: string, id_account: string) {
    return await this.accountModel
      .find({
        dependencia: id_dependency,
        isVisible: true,
        activo: true,
        funcionario: { $ne: null },
        _id: { $ne: id_account },
      })
      .select('_id')
      .populate({
        path: 'funcionario',
        populate: {
          path: 'cargo',
          select: 'nombre',
        },
      });
  }

  async disable(id: string) {
    const { activo } = await this.accountModel.findOneAndUpdate(
      { _id: id },
      [{ $set: { activo: { $eq: [false, '$activo'] } } }],
      { new: true },
    );
    return activo;
  }

  async toggleVisibility(id: string) {
    const { isVisible } = await this.accountModel.findOneAndUpdate(
      { _id: id },
      [{ $set: { isVisible: { $eq: [false, '$isVisible'] } } }],
      { new: true },
    );
    return isVisible;
  }

  async unlink(id: string) {
    const result = await this.accountModel.updateOne(
      { _id: id },
      { $unset: { funcionario: 1 } },
    );
    if (result.matchedCount === 0)
      throw new NotFoundException(`La cuenta ${id} no existe`);
    return { message: 'Cuenta desvinculada' };
  }

  private get populateOptions(): mongoose.PopulateOptions[] {
    return [
      {
        path: 'dependencia',
        select: 'nombre institucion',
        populate: {
          path: 'institucion',
          select: 'nombre',
        },
      },
      {
        path: 'funcionario',
        populate: {
          path: 'cargo',
          select: 'nombre',
        },
      },
    ];
  }

  private encryptPassword(password: string): string {
    const salt = bcrypt.genSaltSync();
    return bcrypt.hashSync(password, salt);
  }

  private async checkDuplicateLogin(login: string) {
    const duplicate = await this.userModel.findOne({ login });
    if (duplicate) {
      throw new BadRequestException(`El login ya existre ${login}`);
    }
  }

  private removePasswordField(account: Account) {
    const result = { ...account.toObject() };
    delete result.password;
    return result;
  }
}
