import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { CreateAccountDto } from '../dto/create-account.dto';
import { OfficerService } from './officer.service';
import { CreateOfficerDto } from '../dto/create-officer.dto';
import { UpdateAccountDto } from '../dto/update-account.dto';
import { Account } from 'src/auth/schemas/account.schema';
@Injectable()
export class AccountService {
  constructor(
    @InjectModel(Account.name) private accountModel: Model<Account>,
    private readonly officerService: OfficerService,
  ) {}
  async search(
    limit: number,
    offset: number,
    text: string,
    institution: string | undefined,
    dependency: string | undefined,
  ) {
    offset = offset * limit;
    const query = {};
    if (institution) {
      query['dependencia.institucion._id'] = new mongoose.Types.ObjectId(
        institution,
      );
      if (dependency) {
        query['dependencia._id'] = new mongoose.Types.ObjectId(dependency);
      }
    }
    if (text) {
      query['$or'] = [
        { 'funcionario.fullname': new RegExp(text, 'i') },
        { 'funcionario.dni': new RegExp(text, 'i') },
      ];
    }
    const data = await this.accountModel.aggregate([
      {
        $lookup: {
          from: 'dependencias',
          localField: 'dependencia',
          foreignField: '_id',
          as: 'dependencia',
        },
      },
      {
        $unwind: {
          path: '$dependencia',
        },
      },
      {
        $project: {
          password: 0,
        },
      },
      {
        $lookup: {
          from: 'instituciones',
          localField: 'dependencia.institucion',
          foreignField: '_id',
          as: 'dependencia.institucion',
        },
      },
      {
        $unwind: {
          path: '$dependencia.institucion',
        },
      },
      {
        $lookup: {
          from: 'funcionarios',
          let: { funcionarioId: '$funcionario' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$_id', '$$funcionarioId'] },
              },
            },
            {
              $lookup: {
                from: 'cargos',
                localField: 'cargo',
                foreignField: '_id',
                as: 'cargo',
              },
            },
          ],
          as: 'funcionario',
        },
      },
      {
        $unwind: {
          path: '$funcionario',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: '$funcionario.cargo',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
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
        },
      },
      {
        $match: query,
      },
      {
        $facet: {
          paginatedResults: [{ $skip: offset }, { $limit: limit }],
          totalCount: [
            {
              $count: 'count',
            },
          ],
        },
      },
    ]);
    const accounts = data[0].paginatedResults;
    const length = data[0].totalCount[0] ? data[0].totalCount[0].count : 0;
    return { accounts, length };
  }
  async findAll(limit: number, offset: number) {
    offset = offset * limit;
    const [accounts, length] = await Promise.all([
      this.accountModel
        .find({ _id: { $ne: '639dde6d495c82b3794d6606' } }, { password: 0 })
        .skip(offset)
        .limit(limit)
        .sort({ _id: -1 })
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
            select: 'nombre',
          },
        }),
      this.accountModel.count({ _id: { $ne: process.env.ID_ROOT } }),
    ]);
    return { accounts, length };
  }
  async createAccountWithOfficer(
    officer: CreateOfficerDto,
    account: CreateAccountDto,
  ) {
    const accountDB = await this.accountModel.findOne({ login: account.login });
    if (accountDB)
      throw new BadRequestException('El login introducido ya existe');
    officer.cuenta = true;
    const createdOfficer = await this.officerService.add(officer, undefined);
    return await this.create(createdOfficer._id, account);
  }
  async createAccountWithAssignment(account: CreateAccountDto) {
    const accountDB = await this.accountModel.findOne({ login: account.login });
    if (accountDB)
      throw new BadRequestException('El login introducido ya existe');
    if (!account.funcionario)
      throw new BadRequestException(
        'No se selecciono ningun funcionario para crear la cuenta',
      );
    const assignedAccountDB = await this.accountModel.findOne({
      funcionario: account.funcionario,
    });
    if (assignedAccountDB)
      throw new BadRequestException(
        'El funcionario seleccionado ya esta asignado a una cuenta',
      );
    await this.officerService.markOfficerWithAccount(account.funcionario, true);
    return await this.create(account.funcionario, account);
  }
  async create(id_officer: string, account: CreateAccountDto) {
    const salt = bcrypt.genSaltSync();
    const encryptedPassword = bcrypt.hashSync(account.password, salt);
    account.password = encryptedPassword;
    account.funcionario = id_officer;
    const createdAccount = new this.accountModel(account);
    await createdAccount.save();
    await createdAccount.populate([
      {
        path: 'dependencia',
        populate: {
          path: 'institucion',
        },
      },
      {
        path: 'funcionario',
        populate: {
          path: 'cargo',
        },
      },
    ]);
    delete createdAccount.password;
    return createdAccount;
  }
  async findOfficersForAssign(text: string) {
    return await this.officerService.findOfficersWithoutAccount(text);
  }
  async update(id_account: string, account: UpdateAccountDto) {
    const accountDB = await this.accountModel.findById(id_account);
    if (!accountDB) throw new BadRequestException('La cuenta no existe');
    if (accountDB.login !== account.login) {
      const duplicateLogin = await this.accountModel.findOne({
        login: account.login,
      });
      if (duplicateLogin)
        throw new BadRequestException('El login introducido ya existe');
    }
    if (account.password) {
      const salt = bcrypt.genSaltSync();
      const encryptedPassword = bcrypt.hashSync(
        account.password.toString(),
        salt,
      );
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
    if (!accountDB)
      throw new BadRequestException('La cuenta seleccionada no existe');
    if (!accountDB.funcionario)
      throw new BadRequestException('La cuenta ya ha sido desvinculada');
    const updatedAccount = await this.accountModel
      .findByIdAndUpdate(
        id_account,
        { activo: false, $unset: { funcionario: 1 } },
        { new: true },
      )
      .populate({
        path: 'dependencia',
        populate: {
          path: 'institucion',
        },
      });
    await this.officerService.markOfficerWithAccount(
      accountDB.funcionario._id,
      false,
    );
    return updatedAccount;
  }

  async assingAccountOfficer(id_account: string, id_officer: string) {
    const accountDB = await this.accountModel
      .findById(id_account)
      .populate('funcionario');
    if (!accountDB)
      throw new BadRequestException('La cuenta seleccionada no existe');
    if (accountDB.funcionario)
      throw new BadRequestException(
        `La cuenta ya ha sido asignanda a ${accountDB.funcionario.nombre} ${accountDB.funcionario.paterno} ${accountDB.funcionario.materno}`,
      );
    await this.officerService.markOfficerWithAccount(id_officer, true);
    return await this.accountModel
      .findByIdAndUpdate(
        id_account,
        { funcionario: id_officer, activo: true },
        { new: true },
      )
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
}
