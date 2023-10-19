import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Observation, Procedure } from '../schemas';
import { CreateObservationDto } from '../dto';
import { stateProcedure } from '../interfaces';
import { createFullName } from 'src/administration/helpers/fullname';
import { Account } from 'src/auth/schemas/account.schema';

@Injectable()
export class ObservationService {
  constructor(
    @InjectModel(Observation.name) private observationModel: Model<Observation>,
    @InjectModel(Procedure.name) private procedureModel: Model<Procedure>,
    @InjectModel(Account.name) private accountModel: Model<Account>,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}

  async getObservationsOfProcedure(id_procedure: string) {
    return await this.observationModel.find({ procedure: id_procedure });
  }

  async addObservation(
    id_procedure: string,
    account: Account,
    observationDto: CreateObservationDto,
  ) {
    const procedureDB = await this.procedureModel.findById(id_procedure);
    if (!procedureDB) throw new BadRequestException('El tramite no existe');
    const disallowedStates = [stateProcedure.ANULADO, stateProcedure.CONCLUIDO];
    if (disallowedStates.includes(procedureDB.state))
      throw new BadRequestException('El tramite ya ha sido finalizado');
    const session = await this.connection.startSession();
    try {
      session.startTransaction();
      if (procedureDB.state !== stateProcedure.OBSERVADO) {
        await this.procedureModel.updateOne(
          { _id: id_procedure },
          { state: stateProcedure.OBSERVADO },
          { session },
        );
      }
      const { funcionario } = await this.accountModel.populate(account, {
        path: 'funcionario',
        select: 'nombre paterno materno',
      });
      const newObservation = new this.observationModel({
        procedure: id_procedure,
        account: account._id,
        description: `${createFullName(funcionario)}: ${
          observationDto.description
        }`,
      });
      const createdObservation = await newObservation.save({ session });
      await session.commitTransaction();
      return createdObservation;
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException(
        'No se puedo registrar la observacion de un tramite',
      );
    } finally {
      session.endSession();
    }
  }

  // async solveObservation(id_observation: string) {
  //   const observationDB = await this.observationModel.findByIdAndUpdate(
  //     id_observation,
  //     {
  //       isSolved: true,
  //     },
  //   );

  //   await this.observationModel.fin;
  // }
}
