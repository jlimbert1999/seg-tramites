import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Observaciones, Observation, Procedure } from '../schemas';
import { CreateObservationDto } from '../dto';
import { stateProcedure } from '../interfaces';
import { createFullName } from 'src/administration/helpers/fullname';
import { Account } from 'src/users/schemas';

@Injectable()
export class ObservationService {
  constructor(
    @InjectModel(Observation.name) private observationModel: Model<Observation>,
    @InjectModel(Procedure.name) private procedureModel: Model<Procedure>,
    @InjectModel(Account.name) private accountModel: Model<Account>,
    @InjectModel(Observaciones.name) private oldObservacionesModel: Model<Observaciones>,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}

  async generateCollection() {
    // const observationes = await this.oldObservacionesModel.find({});
    // for (const obs of observationes) {
    //   const procedure = await this.procedureModel.findOne({ tramite: obs.procedure });
    //   const { officer } = await obs.populate({ path: 'officer' });
    //   const fullname = createFullName(officer);
    //   const newObservation = new this.observationModel({
    //     procedure: procedure._id,
    //     account: obs.account,
    //     fullnameOfficer: fullname,
    //     description: obs.description,
    //     isSolved: obs.solved,
    //     date: obs.date,
    //   });
    //   await newObservation.save();
    // }
    // console.log('end');
  }

  async getObservationsOfProcedure(id_procedure: string) {
    return await this.observationModel.find({ procedure: id_procedure }).sort({ date: -1 });
  }

  async add(id_procedure: string, account: Account, { description }: CreateObservationDto) {
    const state = await this.checkIfStateProcedureIsValid(id_procedure);
    const session = await this.connection.startSession();
    try {
      session.startTransaction();
      if (state !== stateProcedure.OBSERVADO) {
        await this.procedureModel.findByIdAndUpdate(id_procedure, { state: stateProcedure.OBSERVADO }, { session });
      }
      const { funcionario } = await this.accountModel.populate(account, {
        path: 'funcionario',
      });
      const newObservation = new this.observationModel({
        procedure: id_procedure,
        account: account._id,
        fullnameOfficer: createFullName(funcionario),
        description,
      });
      const createdObservation = await newObservation.save({ session });
      await session.commitTransaction();
      return createdObservation;
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('No se puede registrar la observacion');
    } finally {
      session.endSession();
    }
  }

  async checkIfStateProcedureIsValid(id_procedure: string): Promise<stateProcedure> {
    const procedureDB = await this.procedureModel.findById(id_procedure);
    if (!procedureDB) throw new BadRequestException('El tramite no existe');
    const invalidStates = [stateProcedure.ANULADO, stateProcedure.CONCLUIDO, stateProcedure.SUSPENDIDO];
    if (invalidStates.includes(procedureDB.state)) throw new BadRequestException('El tramite ya ha sido finalizado');
    return procedureDB.state;
  }

  async solveObservation(id_observation: string) {
    const session = await this.connection.startSession();
    try {
      session.startTransaction();
      const observationDB = await this.observationModel.findByIdAndUpdate(
        id_observation,
        { isSolved: true },
        { session, new: true },
      );
      if (!observationDB) throw new BadRequestException('La observacion no existe');
      let state = stateProcedure.OBSERVADO;
      const pendingObservation = await this.observationModel.findOne(
        {
          procedure: observationDB.procedure._id,
          isSolved: false,
        },
        undefined,
        { session },
      );
      console.log(pendingObservation);
      if (!pendingObservation) {
        await this.procedureModel.updateOne(
          { _id: observationDB.procedure._id },
          { state: stateProcedure.EN_REVISION },
          { session },
        );
        state = stateProcedure.EN_REVISION;
      }
      await session.commitTransaction();
      return { state };
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('No se puede registrar la observacion');
    } finally {
      session.endSession();
    }
  }
}
