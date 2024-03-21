import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Communication, ExternalDetail, Observation, Procedure } from 'src/procedures/schemas';
import { ApplicantQueryDto } from './dto/query.dto';
import { statusMail } from 'src/procedures/interfaces';

@Injectable()
export class ApplicantService {
  constructor(
    @InjectModel(Procedure.name) private procedureModel: Model<Procedure>,
    @InjectModel(ExternalDetail.name) private externalModel: Model<ExternalDetail>,
    @InjectModel(Communication.name) private communicationModel: Model<Communication>,
    @InjectModel(Observation.name) private observationModel: Model<Observation>,
  ) {}

  async search({ dni, pin }: ApplicantQueryDto) {
    const detail = await this.externalModel.findOne({ pin: pin, 'solicitante.dni': dni });
    if (!detail) throw new NotFoundException(`El tramite solicitado no existe`);
    const procedure = await this.procedureModel
      .findOne({ details: detail._id }, { account: 0, cite: 0 })
      .populate('type', '-_id nombre')
      .populate('details', '-_id');

    const [workflow, observations] = await Promise.all([
      this.getWorkflow(procedure._id),
      this.getObservations(procedure._id),
    ]);
    return { procedure, workflow, observations };
  }

  private async getWorkflow(id_procedure: string) {
    const workflow = await this.communicationModel
      .find({
        procedure: id_procedure,
        status: { $ne: statusMail.Rejected },
      })
      .select({ emitter: 1, receiver: 1, _id: 0 })
      .populate([
        {
          path: 'emitter.cuenta',
          select: 'dependencia',
          populate: { path: 'dependencia', select: 'nombre -_id' },
        },
        {
          path: 'receiver.cuenta',
          select: 'dependencia',
          populate: { path: 'dependencia', select: 'nombre -_id' },
        },
      ]);
    return workflow;
  }

  private async getObservations(id_procedure: string) {
    return await this.observationModel.find(
      {
        procedure: id_procedure,
        isSolved: false,
      },
      { fullnameOfficer: 1, description: 1, date: 1, _id: 0 },
    );
  }
}
