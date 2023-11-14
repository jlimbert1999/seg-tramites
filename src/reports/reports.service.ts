import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { ExternalDetail, Procedure } from 'src/procedures/schemas';
import { PaginationParamsDto } from 'src/common/dto/pagination.dto';
import { SearchProcedureByApplicantDto, SearchProcedureByCodeDto } from './dto';
import { Account } from 'src/auth/schemas/account.schema';
// import { workAccountDetails } from 'src/procedures/interfaces/work-account-details.interface';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Procedure.name) private procedureModel: Model<Procedure>,
    @InjectModel(ExternalDetail.name) private externalProcedureModel: Model<ExternalDetail>,
    @InjectModel(Account.name) private accountModel: Model<Account>,
  ) {}
  async searchProcedureByCode({ code }: SearchProcedureByCodeDto) {
    const procedureDB = await this.procedureModel.findOne({ code: code.toUpperCase() }).select('_id group');
    if (!procedureDB) throw new BadRequestException(`El tramite ${code} no existe. Revise los caracteres`);
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
    const procedures = await this.procedureModel.find({ details: { $in: details } }).populate('details');
    return { procedures, length };
  }

  async getDetailsDependentsByUnit(id_dependency: string) {
    const accounts = await this.accountModel.find({ dependencia: id_dependency });
    for (const account of accounts) {
    }
  }
}
