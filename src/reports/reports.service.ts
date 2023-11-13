import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { ExternalDetail, Procedure } from 'src/procedures/schemas';
import { PaginationParamsDto } from 'src/common/dto/pagination.dto';
import { SearchProcedureByApplicantDto, SearchProcedureByCodeDto } from './dto';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Procedure.name) private procedureModel: Model<Procedure>,
    @InjectModel(ExternalDetail.name) private externalProcedureModel: Model<ExternalDetail>,
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
    const query: mongoose.FilterQuery<ExternalDetail> = Object.entries(applicantDto).reduce((acc, [key, value]) => {
      acc[`${applicant}.${key}`] = value;
      return acc;
    }, {});
    const details = await this.externalProcedureModel.find(query).limit(limit).skip(offset).select('_id');
    const [procedures, length] = await Promise.all([
      this.procedureModel.find({ details: { $in: details } }).populate('details'),
      this.procedureModel.count({ details: { $in: details } }),
    ]);
    return { procedures, length };
  }
}
