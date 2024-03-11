import { BadGatewayException, BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Communication, ExternalDetail, Procedure } from 'src/procedures/schemas';
import { ApplicantQueryDto } from './dto/query.dto';
import { statusMail } from 'src/procedures/interfaces';

@Injectable()
export class ApplicantService {
  constructor(
    @InjectModel(Procedure.name) private procedureModel: Model<Procedure>,
    @InjectModel(ExternalDetail.name) private externalModel: Model<ExternalDetail>,
    @InjectModel(Communication.name) private communicationModel: Model<Communication>,
  ) {}

  async search({ dni, pin }: ApplicantQueryDto) {
    const detail = await this.externalModel.findOne({ pin: pin, 'solicitante.dni': dni });
    if (!detail) throw new BadRequestException(`El tramite solicitado no existe`);
    const procedure = await this.procedureModel
      .findOne({ details: detail._id }, { account: 0, cite: 0, __v: 0, _id: 0 })
      .populate('type', '-_id nombre')
      .populate('details', '-_id -__v');
    const workflow = await this.getWorkflow(procedure._id);
    return { procedure, workflow };
  }
  
  async getWorkflow(id_procedure: string) {
    const workflow = await this.communicationModel.find({
      procedure: id_procedure,
      status: { $ne: statusMail.Rejected },
    });
    return workflow;
  }
}
