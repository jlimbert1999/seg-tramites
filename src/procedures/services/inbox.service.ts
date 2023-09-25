import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Communication, Procedure } from '../schemas';
import { Account } from 'src/administration/schemas';
import { createFullName } from 'src/administration/helpers/fullname';
import { stateProcedure } from '../interfaces/states-procedure.interface';
import { CreateCommunicationDto, ReceiverDto } from '../dto';
import { PaginationParamsDto } from 'src/shared/interfaces/pagination_params';
import { statusMail } from '../interfaces';

@Injectable()
export class InboxService {
  constructor(
    @InjectModel(Account.name) private readonly accountModel: Model<Account>,
    @InjectModel(Procedure.name)
    private readonly procedureModel: Model<Procedure>,
    @InjectModel(Communication.name)
    private communicationModel: Model<Communication>,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}

  


 

 





  async getMail() {
    // const mail = await this.inboxModel
    //   .findById(id_inbox)
    //   .populate('tramite')
    //   .populate({
    //     path: 'emisor.cuenta',
    //     select: 'dependencia',
    //     populate: {
    //       path: 'dependencia',
    //       select: 'nombre',
    //       populate: {
    //         path: 'institucion',
    //         select: 'nombre',
    //       },
    //     },
    //   });
    // if (!mail)
    //   throw new BadRequestException(
    //     'El envio de este tramite ha sido cancelado',
    //   );
    // return mail;
  }

  async getLocationProcedure(id_procedure: string) {
    // return await this.inboxModel
    //   .find({ tramite: id_procedure })
    //   .select('receptor')
    //   .populate({
    //     path: 'receptor.cuenta',
    //     select: 'funcionario dependencia',
    //     populate: [
    //       {
    //         path: 'funcionario',
    //         select: 'nombre paterno materno cargo',
    //         populate: {
    //           path: 'cargo',
    //           select: 'nombre',
    //         },
    //       },
    //       {
    //         path: 'dependencia',
    //         select: 'nombre',
    //       },
    //     ],
    //   });
  }
}
