import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Communication, ExternalDetail, Procedure } from 'src/procedures/schemas';
import { PaginationParamsDto } from 'src/common/dto/pagination.dto';
import {
  GetTotalMailsDto,
  GetTotalProceduresDto,
  SearchProcedureByApplicantDto,
  SearchProcedureByPropertiesDto,
  searchProcedureByUnitDto,
} from './dto';
import { groupProcedure, statusMail } from 'src/procedures/interfaces';
import { Dependency } from 'src/administration/schemas';
import { Account } from 'src/users/schemas';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Account.name) private accountModel: Model<Account>,
    @InjectModel(Procedure.name) private procedureModel: Model<Procedure>,
    @InjectModel(Dependency.name) private dependencyModel: Model<Dependency>,
    @InjectModel(Communication.name) private communicationModel: Model<Communication>,
    @InjectModel(ExternalDetail.name) private externalProcedureModel: Model<ExternalDetail>,
  ) {}

  async searchProcedureByApplicant(
    type: 'solicitante' | 'representante',
    applicantDto: SearchProcedureByApplicantDto,
    { limit, offset }: PaginationParamsDto,
  ) {
    const query = Object.entries(applicantDto).reduce((acc, [key, value]) => {
      if (key === 'nombre') value = new RegExp(value, 'i');
      acc[`${type}.${key}`] = value;
      return acc;
    }, {});
    if (Object.keys(query).length === 0) {
      throw new BadRequestException('Ingrese al menos un campo para generar el reporte');
    }
    const [details, length] = await Promise.all([
      this.externalProcedureModel.find(query).lean().limit(limit).skip(offset).select('_id'),
      this.externalProcedureModel.count(query),
    ]);
    const procedures = await this.procedureModel
      .find({ details: { $in: details.map((detail) => detail._id) }, group: groupProcedure.EXTERNAL })
      .lean()
      .populate('details')
      .lean();
    return { procedures, length };
  }

  async searchProcedureByProperties(
    { limit, offset }: PaginationParamsDto,
    properties: SearchProcedureByPropertiesDto,
  ) {
    const { start, end, ...values } = properties;
    const query: mongoose.FilterQuery<Procedure>[] = Object.entries(values).map(([key, value]) => {
      if (key === 'code' || key === 'reference') return { [key]: new RegExp(value, 'i') };
      return { [key]: value };
    });
    const interval = {
      ...(start && { $gte: new Date(start) }),
      ...(end && { $lte: new Date(end) }),
    };
    if (Object.keys(interval).length > 0) query.push({ startDate: interval });
    if (query.length === 0) throw new BadRequestException('Ingrese los parametros para generar el reporte');
    const [procedures, length] = await Promise.all([
      this.procedureModel.find({ $and: query }).lean().limit(limit).skip(offset),
      this.procedureModel.count({ $and: query }),
    ]);
    return { procedures, length };
  }

  async getDetailsDependentsByUnit(id_dependency: string) {
    const accounts = await this.getOfficersInDependency(id_dependency);
    const results = await this.communicationModel
      .aggregate()
      .match({
        'receiver.cuenta': { $in: accounts.map((account) => account._id) },
        status: { $in: [statusMail.Received, statusMail.Pending, statusMail.Rejected, statusMail.Archived] },
      })
      .group({
        _id: {
          account: '$receiver.cuenta',
          status: '$status',
        },
        count: { $sum: 1 },
      })
      .group({
        _id: '$_id.account',
        details: {
          $push: {
            status: '$_id.status',
            total: '$count',
          },
        },
        count: { $sum: '$count' },
      })
      .sort({ count: -1 });
    const dependents = results.map((result) => {
      result['_id'] = accounts.find((account) => String(account._id) == result._id);
      return result;
    });
    return dependents;
  }
  async searchProcedureByUnit(
    id_dependency: string,
    properties: searchProcedureByUnitDto,
    { limit, offset }: PaginationParamsDto,
  ) {
    const { start, end, status, account } = properties;
    const query: mongoose.FilterQuery<Communication>[] = [];
    const interval = {
      ...(start && { $gte: new Date(start) }),
      ...(end && { $lte: new Date(end) }),
    };
    if (Object.keys(interval).length > 0) query.push({ outboundDate: interval });
    if (status) query.push({ status });
    if (!account) {
      const accounts = await this.accountModel.find({ dependencia: id_dependency });
      const ids_receivers = accounts.map((account) => account._id);
      query.push({ 'receiver.cuenta': { $in: ids_receivers } });
    } else {
      query.push({ 'receiver.cuenta': account });
    }
    if (query.length === 0) throw new BadRequestException('No se ingresaron parametros para la busqueda');
    const [communications, length] = await Promise.all([
      this.communicationModel
        .find({ $and: query })
        .populate('procedure', 'code reference group state')
        .limit(limit)
        .skip(offset),
      this.communicationModel.count({ $and: query }),
    ]);
    return { communications, length };
  }

  async getOfficersInDependency(id_dependency: string): Promise<Account[]> {
    return await this.accountModel
      .find({ dependencia: id_dependency })
      .select('funcionario')
      .populate({
        path: 'funcionario',
        select: 'nombre paterno materno cargo',
        populate: { path: 'cargo', select: 'nombre' },
      });
  }

  async getTotalMailsByInstitution(id_institution: string, { group, participant }: GetTotalMailsDto) {
    const dependencies = await this.dependencyModel.find({ institucion: id_institution }).select('nombre');
    const accounts = await this.accountModel.find({ dependencia: { $in: dependencies.map((dep) => dep._id) } });
    const query: mongoose.FilterQuery<Communication> =
      participant === 'receiver'
        ? { 'receiver.cuenta': { $in: accounts.map((acc) => acc._id) } }
        : { 'emitter.cuenta': { $in: accounts.map((acc) => acc._id) } };
    const data = await this.communicationModel
      .aggregate()
      .match(query)
      .lookup({
        from: 'cuentas',
        foreignField: '_id',
        localField: `${participant}.cuenta`,
        as: `${participant}.cuenta`,
      })
      .lookup({
        from: 'procedures',
        foreignField: '_id',
        localField: `procedure`,
        as: `procedure`,
      })
      .match({ 'procedure.group': group })
      .group({
        _id: {
          account: `$${participant}.cuenta.dependencia`,
          status: '$status',
        },
        count: { $sum: 1 },
      })
      .group({
        _id: '$_id.account',
        details: {
          $push: {
            field: '$_id.status',
            count: '$count',
          },
        },
        total: { $sum: '$count' },
      })
      .unwind('$_id')
      .sort({ total: -1 });
    data.map((element) => {
      const dependency = dependencies.find((dep) => String(dep._id) === String(element._id));
      element['name'] = dependency ? dependency.nombre : 'Sin nombre';
      return element;
    });
    return data;
  }
  async getTotalProceduresByInstitution(id_institution: string, { group }: GetTotalProceduresDto) {
    const dependencies = await this.dependencyModel.find({ institucion: id_institution }).select('nombre');
    const accounts = await this.accountModel.find({ dependencia: { $in: dependencies.map((dep) => dep._id) } });
    const data = await this.procedureModel
      .aggregate()
      .match({ group, account: { $in: accounts.map((acc) => acc._id) } })
      .lookup({
        from: 'cuentas',
        localField: 'account',
        foreignField: '_id',
        as: 'account',
      })
      .group({
        _id: {
          dependency: '$account.dependencia',
          state: '$state',
        },
        count: { $sum: 1 },
      })
      .group({
        _id: '$_id.dependency',
        details: {
          $push: {
            field: '$_id.state',
            count: '$count',
          },
        },
        total: { $sum: '$count' },
      })
      .unwind('$_id')
      .sort({ total: -1 });
    data.map((element) => {
      const dependency = dependencies.find((dep) => String(dep._id) === String(element._id));
      element['name'] = dependency ? dependency.nombre : 'Sin nombre';
      return element;
    });
    return data;
  }
  async getTotalInboxByUser() {
    return await this.communicationModel
      .aggregate()
      .match({ status: { $in: [statusMail.Received, statusMail.Pending] } })
      .group({
        _id: {
          account: `$receiver.cuenta`,
          status: '$status',
        },
        count: { $sum: 1 },
      })
      .group({
        _id: '$_id.account',
        details: {
          $push: {
            status: '$_id.status',
            count: '$count',
          },
        },
        total: { $sum: '$count' },
      })
      .sort({ total: -1 })
      .lookup({
        from: 'cuentas',
        localField: '_id',
        foreignField: '_id',
        as: '_id',
        pipeline: [{ $project: { funcionario: 1 } }],
      })
      .unwind('_id')
      .lookup({
        from: 'funcionarios',
        localField: '_id.funcionario',
        foreignField: '_id',
        as: '_id.funcionario',
        pipeline: [{ $project: { nombre: 1, paterno: 1, materno: 1, cargo: 1 } }],
      })
      .unwind({ path: '$_id.funcionario', preserveNullAndEmptyArrays: true })
      .lookup({
        from: 'cargos',
        localField: '_id.funcionario.cargo',
        foreignField: '_id',
        as: '_id.funcionario.cargo',
        pipeline: [{ $project: { nombre: 1 } }],
      })
      .unwind({ path: '$_id.funcionario.cargo', preserveNullAndEmptyArrays: true })
      .limit(100000);
  }

  async getAccountInbox(account: Account) {
    await account.populate([
      {
        path: 'funcionario',
        select: 'nombre paterno materno',
        populate: { path: 'cargo', select: 'nombre' },
      },
      {
        path: 'dependencia',
        select: 'nombre',
      },
    ]);
    const inbox = await this.communicationModel
      .find({ 'receiver.cuenta': account._id, status: { $in: [statusMail.Received, statusMail.Pending] } })
      .lean()
      .populate('procedure');
    return { account, inbox };
  }

  async getWorkDetails(id_account: string) {
    return await this.communicationModel
      .aggregate()
      .match({
        'receiver.cuenta': new mongoose.Types.ObjectId(id_account),
      })
      .group({
        _id: '$status',
        count: { $sum: 1 },
      });
  }
}
