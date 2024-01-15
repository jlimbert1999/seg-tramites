import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import mongoose, { FilterQuery, Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { CreateAccountDto } from '../dtos/create-account.dto';
import { CreateOfficerDto } from '../dtos/create-officer.dto';
import { UpdateAccountDto } from '../dtos/update-account.dto';
import { Account } from '../../users/schemas';
import { ConfigService } from '@nestjs/config';
import { GetAccountsDto, FilterAccountsDto } from '../dtos';
import { OfficerService } from './officer.service';

@Injectable()
export class AccountService {
  constructor(
    @InjectModel(Account.name) private accountModel: Model<Account>,
    private configService: ConfigService,
    private readonly officerService: OfficerService,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}

  async findAll({ id_dependency, limit, offset }: GetAccountsDto) {
    const query: FilterQuery<Account> = {
      _id: { $ne: this.configService.get('id_root') },
      ...(id_dependency && { dependencia: id_dependency }),
    };
    const [accounts, length] = await Promise.all([
      this.accountModel
        .find(query, { password: 0 })
        .lean()
        .skip(offset)
        .limit(limit)
        .sort({ _id: -1 })
        .populate('dependencia')
        .populate({
          path: 'funcionario',
          populate: {
            path: 'cargo',
            select: 'nombre',
          },
        }),
      this.accountModel.count(query),
    ]);
    return { accounts, length };
  }

  async search({ id_dependency, text, limit, offset }: FilterAccountsDto) {
    const regex = new RegExp(text, 'i');
    const query: FilterQuery<Account> = {
      ...(id_dependency && { dependencia: new mongoose.Types.ObjectId(id_dependency) }),
      $or: [{ 'funcionario.fullname': regex }, { 'funcionario.dni': regex }, { 'funcionario.cargo.nombre': regex }],
    };
    const data = await this.accountModel
      .aggregate()
      .match({ funcionario: { $ne: null } })
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
      .lookup({
        from: 'cargos',
        localField: 'funcionario.cargo',
        foreignField: '_id',
        as: 'funcionario.cargo',
      })
      .unwind({ path: '$funcionario.cargo', preserveNullAndEmptyArrays: true })
      .addFields({
        'funcionario.fullname': {
          $cond: {
            if: { $eq: [{ $type: '$funcionario' }, 'object'] },
            then: {
              $concat: [
                '$funcionario.nombre',
                ' ',
                { $ifNull: ['$funcionario.paterno', ''] },
                ' ',
                { $ifNull: ['$funcionario.materno', ''] },
              ],
            },
            else: '$$REMOVE',
          },
        },
      })
      .match(query)
      .facet({
        paginatedResults: [{ $skip: offset }, { $limit: limit }],
        totalCount: [
          {
            $count: 'count',
          },
        ],
      });
    const accounts = data[0].paginatedResults;
    await this.accountModel.populate(accounts, 'dependencia');
    const length = data[0].totalCount[0] ? data[0].totalCount[0].count : 0;
    return { accounts, length };
  }

  async createAccountWithAssignment(account: CreateAccountDto) {
    // const accountDB = await this.accountModel.findOne({ login: account.login });
    // if (accountDB) throw new BadRequestException('El login introducido ya existe');
    // if (!account.funcionario) throw new BadRequestException('No se selecciono ningun funcionario para crear la cuenta');
    // const assignedAccountDB = await this.accountModel.findOne({
    //   funcionario: account.funcionario,
    // });
    // if (assignedAccountDB) throw new BadRequestException('El funcionario seleccionado ya esta asignado a una cuenta');
    // await this.officerService.markOfficerWithAccount(account.funcionario, true);
    // return await this.create(account.funcionario, account);
  }
  async create(account: CreateAccountDto, officer: CreateOfficerDto) {
    const session = await this.connection.startSession();
    try {
      session.startTransaction();
      const { _id } = await this.officerService.createOfficerForAccount(officer, session);
      const salt = bcrypt.genSaltSync();
      const encryptedPassword = bcrypt.hashSync(account.password, salt);
      account.password = encryptedPassword;
      let createdAccount = new this.accountModel({ ...account, funcionario: _id });
      await createdAccount.save({ session });
      await createdAccount.populate([
        {
          path: 'dependencia',
        },
        {
          path: 'funcionario',
          populate: {
            path: 'cargo',
          },
        },
      ]);
      await session.commitTransaction();
      createdAccount = createdAccount.toObject();
      delete createdAccount.password;
      return createdAccount;
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Error al crear cuenta');
    } finally {
      session.endSession();
    }
  }
  async findOfficersForAssign(text: string) {
    // return await this.officerService.findOfficersWithoutAccount(text);
  }
  async update(id_account: string, account: UpdateAccountDto) {
    const accountDB = await this.accountModel.findById(id_account);
    if (!accountDB) throw new BadRequestException('La cuenta no existe');
    if (accountDB.login !== account.login) {
      const duplicateLogin = await this.accountModel.findOne({
        login: account.login,
      });
      if (duplicateLogin) throw new BadRequestException('El login introducido ya existe');
    }
    if (account.password) {
      const salt = bcrypt.genSaltSync();
      const encryptedPassword = bcrypt.hashSync(account.password.toString(), salt);
      account.password = encryptedPassword;
    }
    let updatedAccount = await this.accountModel
      .findByIdAndUpdate(id_account, account, { new: true })
      .populate({
        path: 'dependencia',
        populate: {
          path: 'institucion',
        },
      })
      .populate({
        path: 'funcionario',
        populate: {
          path: 'cargo',
        },
      });
    updatedAccount = updatedAccount.toObject();
    delete updatedAccount.password;
    return updatedAccount;
  }

  async unlinkAccountOfficer(id_account: string) {
    const accountDB = await this.accountModel.findById(id_account);
    if (!accountDB) throw new BadRequestException('La cuenta seleccionada no existe');
    if (!accountDB.funcionario) throw new BadRequestException('La cuenta ya ha sido desvinculada');
    const updatedAccount = await this.accountModel
      .findByIdAndUpdate(id_account, { activo: false, $unset: { funcionario: 1 } }, { new: true })
      .populate({
        path: 'dependencia',
        populate: {
          path: 'institucion',
        },
      });
    // await this.officerService.markOfficerWithAccount(accountDB.funcionario._id, false);
    return updatedAccount;
  }

  async assingAccountOfficer(id_account: string, id_officer: string) {
    const accountDB = await this.accountModel.findById(id_account).populate('funcionario');
    if (!accountDB) throw new BadRequestException('La cuenta seleccionada no existe');
    if (accountDB.funcionario)
      throw new BadRequestException(
        `La cuenta ya ha sido asignanda a ${accountDB.funcionario.nombre} ${accountDB.funcionario.paterno} ${accountDB.funcionario.materno}`,
      );
    // await this.officerService.markOfficerWithAccount(id_officer, true);
    return await this.accountModel
      .findByIdAndUpdate(id_account, { funcionario: id_officer, activo: true }, { new: true })
      .populate({
        path: 'dependencia',
        populate: {
          path: 'institucion',
        },
      })
      .populate({
        path: 'funcionario',
        populate: {
          path: 'cargo',
        },
      });
  }
  async getAccountsForSend(id_dependencie: string, id_account: string) {
    return await this.accountModel
      .find({
        dependencia: id_dependencie,
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
}
