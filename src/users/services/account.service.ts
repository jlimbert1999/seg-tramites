import { Injectable, BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import mongoose, { FilterQuery, Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

import { CreateAccountDto, UpdateAccountDto, GetAccountsDto } from '../dtos';
import { Account } from '../../users/schemas';
import { CreateOfficerDto } from 'src/administration/dtos';
import { OfficerService } from 'src/administration/services';

@Injectable()
export class AccountService {
  constructor(
    private configService: ConfigService,
    private officerService: OfficerService,
    @InjectModel(Account.name) private accountModel: Model<Account>,
    @InjectConnection() private connection: mongoose.Connection,
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
        .populate('dependencia', 'nombre')
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

  async search(term: string, { id_dependency, limit, offset }: GetAccountsDto) {
    const regex = new RegExp(term, 'i');
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
    await this.accountModel.populate(accounts, { path: 'dependencia', select: 'nombre' });
    const length = data[0].totalCount[0] ? data[0].totalCount[0].count : 0;
    return { accounts, length };
  }

  async create(account: CreateAccountDto, officer: CreateOfficerDto) {
    const session = await this.connection.startSession();
    try {
      session.startTransaction();
      const { _id } = await this.officerService.createOfficerForAccount(officer, session);
      await this.checkDuplicateLogin(account.login);
      account.password = this.encryptPassword(account.password);
      const createdAccount = new this.accountModel({ ...account, funcionario: _id });
      await createdAccount.save({ session });
      await createdAccount.populate(this.populateOptions);
      await session.commitTransaction();
      return this.removePasswordField(createdAccount);
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Error al crear cuenta');
    } finally {
      session.endSession();
    }
  }

  async update(id: string, account: UpdateAccountDto) {
    const accountDB = await this.accountModel.findById(id);
    if (!accountDB) throw new NotFoundException(`La cuenta ${id} no existe`);
    if (accountDB.login !== account.login) await this.checkDuplicateLogin(account.login);
    if (account.password) account['password'] = this.encryptPassword(account.password);
    const updated = await this.accountModel
      .findByIdAndUpdate(id, account, { new: true })
      .populate(this.populateOptions);
    return this.removePasswordField(updated);
  }

  async assign(account: CreateAccountDto) {
    if (account.funcionario) {
      const duplicate = await this.accountModel.findOne({ funcionario: account.funcionario });
      if (duplicate) throw new BadRequestException('El funcionario seleccionado ya esta asignado a una cuenta');
    }
    await this.checkDuplicateLogin(account.login);
    const ecryptedPassword = this.encryptPassword(account.password);
    const createdAccount = new this.accountModel({ ...account, password: ecryptedPassword });
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
    const result = await this.accountModel.updateOne({ _id: id }, { $unset: { funcionario: 1 } });
    if (result.matchedCount === 0) throw new NotFoundException(`La cuenta ${id} no existe`);
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
    const duplicate = await this.accountModel.findOne({ login });
    if (duplicate) throw new BadRequestException(`El login ya existre ${login}`);
  }

  private removePasswordField(account: Account) {
    const result = { ...account.toObject() };
    delete result.password;
    return result;
  }
}
