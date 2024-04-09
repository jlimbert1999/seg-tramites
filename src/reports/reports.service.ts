import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { FilterQuery, Model } from 'mongoose';
import { Account } from 'src/users/schemas';
import { Dependency } from 'src/administration/schemas';
import { Communication, ExternalDetail, Procedure } from 'src/procedures/schemas';
import { PaginationParamsDto } from 'src/common/dto/pagination.dto';
import { SearchProcedureByApplicantDto, SearchProcedureByPropertiesDto } from './dto';
import { groupProcedure, StatusMail } from 'src/procedures/interfaces';

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
    { by, properties }: SearchProcedureByApplicantDto,
    { limit, offset }: PaginationParamsDto,
  ) {
    const query: FilterQuery<ExternalDetail> = Object.entries(properties).reduce((acc, [key, value]) => {
      if (key === 'nombre') value = new RegExp(value, 'i');
      acc[`${by}.${key}`] = value;
      return acc;
    }, {});
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
    if (query.length === 0) throw new BadRequestException('Ingrese los parametros necesarios');
    const [procedures, length] = await Promise.all([
      this.procedureModel.find({ $and: query }).lean().limit(limit).skip(offset),
      this.procedureModel.count({ $and: query }),
    ]);
    return { procedures, length };
  }

  async getUnlinkData(account: Account) {
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
      .find({ 'receiver.cuenta': account._id, status: { $in: [StatusMail.Received, StatusMail.Pending] } })
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

  async getTotalCommunications(id_account: string) {
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

  async getPendingsByUnit({ dependencia }: Account) {
    const unit = await this.accountModel.find({ dependencia: dependencia._id }, '_id');
    const results = await this.communicationModel
      .aggregate()
      .match({
        'receiver.cuenta': { $in: unit.map((account) => account._id) },
        status: { $in: [StatusMail.Received, StatusMail.Pending] },
      })
      .group({
        _id: '$receiver.cuenta',
        pendings: { $sum: 1 },
      })
      .sort({ pendings: -1 });
    return await this.accountModel.populate(results, {
      path: '_id',
      select: 'funcionario',
      populate: {
        path: 'funcionario',
        select: '-_id nombre paterno materno cargo',
        populate: { path: 'cargo', select: 'nombre -_id' },
      },
    });
  }

  async getPendingsByAccount(id_account: string) {
    return await this.communicationModel
      .find({ 'receiver.cuenta': id_account })
      .populate('procedure', 'code, reference state');
  }
}
