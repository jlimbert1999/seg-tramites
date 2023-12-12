import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Communication, ExternalDetail, Procedure } from 'src/procedures/schemas';
import { PaginationParamsDto } from 'src/common/dto/pagination.dto';
import {
  SearchProcedureByApplicantDto,
  SearchProcedureByCodeDto,
  searchProcedureByPropertiesDto,
  searchProcedureByUnitDto,
} from './dto';
import { Account } from 'src/auth/schemas/account.schema';
import { workDetailsAccount } from './interfaces';
import { validResources } from 'src/auth/interfaces';
import { groupProcedure, statusMail } from 'src/procedures/interfaces';
import { Dependency } from 'src/administration/schemas';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Procedure.name) private procedureModel: Model<Procedure>,
    @InjectModel(ExternalDetail.name) private externalProcedureModel: Model<ExternalDetail>,
    @InjectModel(Communication.name) private communicationModel: Model<Communication>,
    @InjectModel(Account.name) private accountModel: Model<Account>,
    @InjectModel(Dependency.name) private dependencyModel: Model<Dependency>,
  ) {}
  async searchProcedureByCode({ code }: SearchProcedureByCodeDto) {
    const procedureDB = await this.procedureModel.findOne({ code: code.toUpperCase() }).select('_id group');
    if (!procedureDB) throw new BadRequestException(`El alterno: ${code} no existe.`);
    return procedureDB;
  }
  async searchProcedureByApplicant(
    applicant: 'solicitante' | 'representante',
    applicantDto: SearchProcedureByApplicantDto,
    { limit, offset }: PaginationParamsDto,
  ) {
    const query = Object.entries(applicantDto).reduce((acc, [key, value]) => {
      acc[`${applicant}.${key}`] = value;
      return acc;
    }, {});
    const [details, length] = await Promise.all([
      this.externalProcedureModel.find(query).limit(limit).skip(offset).select('_id'),
      this.externalProcedureModel.count(query),
    ]);
    const procedures = await this.procedureModel
      .find({ details: { $in: details.map((detail) => detail._id) } })
      .populate('details');
    return { procedures, length };
  }
  async searchProcedureByProperties(
    { limit, offset }: PaginationParamsDto,
    properties: searchProcedureByPropertiesDto,
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
    if (query.length === 0) throw new BadRequestException('Los parametros ingresados no son validos');
    const [procedures, length] = await Promise.all([
      this.procedureModel.find({ $and: query }).limit(limit).skip(offset),
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
  async getWorkDetailsOfAccount(id_account: string): Promise<workDetailsAccount> {
    const account = await this.accountModel.findById(id_account).select('rol').populate('rol');
    const workdetails: workDetailsAccount = {
      numberOfRecords: {},
      numberOfShipments: {},
    };
    const permissionNames = account.rol.permissions.map(({ resource }) => resource);
    if (permissionNames.includes(validResources.external)) {
      workdetails.numberOfRecords.external = await this.procedureModel.count({
        account: id_account,
        group: groupProcedure.EXTERNAL,
      });
    }
    if (permissionNames.includes(validResources.internal)) {
      workdetails.numberOfRecords.internal = await this.procedureModel.count({
        account: id_account,
        group: groupProcedure.INTERNAL,
      });
    }
    if (permissionNames.includes(validResources.communication)) {
      const results: { _id: statusMail; count: number }[] = await this.communicationModel.aggregate([
        {
          $match: {
            'receiver.cuenta': new mongoose.Types.ObjectId(id_account),
            $or: [{ status: statusMail.Pending }, { status: statusMail.Received }, { status: statusMail.Rejected }],
          },
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]);
      results.forEach((result) => (workdetails.numberOfShipments[result._id] = result.count));
    }
    return workdetails;
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
  async getTotalMailsByInstitution(id_institution: string, group: 'receiver' | 'emitter') {
    const dependencies = await this.dependencyModel.find({ institucion: id_institution }).select('nombre');
    const accounts = await this.accountModel.find({ dependencia: { $in: dependencies.map((dep) => dep._id) } });
    const query: mongoose.FilterQuery<Communication> =
      group === 'receiver'
        ? { 'receiver.cuenta': { $in: accounts.map((acc) => acc._id) } }
        : { 'emitter.cuenta': { $in: accounts.map((acc) => acc._id) } };
    const data = await this.communicationModel
      .aggregate()
      .match(query)
      .lookup({
        from: 'cuentas',
        foreignField: '_id',
        localField: `${group}.cuenta`,
        as: `${group}.cuenta`,
      })
      .group({
        _id: {
          account: `$${group}.cuenta.dependencia`,
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
      .unwind('$_id')
      .sort({ total: -1 });
    data.map((element) => {
      const dependency = dependencies.find((dep) => String(dep._id) === String(element._id));
      element['name'] = dependency ? dependency.nombre : 'Sin nombre';
      return element;
    });
    return data;
  }
  async getTotalProceduresByInstitution(id_institution: string, group: groupProcedure) {
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
            state: '$_id.state',
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
}
