import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Imbox, Outbox, Procedure } from '../schemas/index';
import { Account } from 'src/administration/schemas';
import { CreateInboxDto } from '../dto/create-inbox.dto';
import { createFullName } from 'src/administration/helpers/fullname';

@Injectable()
export class InboxService {
  constructor(
    @InjectModel(Imbox.name) private inboxModel: Model<Imbox>,
    @InjectModel(Outbox.name) private outboxModel: Model<Outbox>,
    @InjectModel(Account.name) private accountModel: Model<Account>,
    @InjectModel(Procedure.name) private procedureModel: Model<Procedure>,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}

  async getAccountForSend(id_dependencie: string, id_account: string) {
    return await this.accountModel
      .find({
        dependencia: id_dependencie,
        activo: true,
        funcionario: { $ne: null },
        _id: { $ne: id_account },
      })
      .select('_id')
      .populate({
        path: 'funcionario',
        populate: {
          path: 'cargo',
          select: 'nombre',
        },
      });
  }
  async getAll(id_account: string, limit: number, offset: number) {
    offset = offset * limit;
    const [mails, length] = await Promise.all([
      this.inboxModel
        .find({ 'receptor.cuenta': id_account })
        .sort({ fecha_envio: -1 })
        .skip(offset)
        .limit(limit)
        .populate('tramite'),
      this.inboxModel.count({ 'receptor.cuenta': id_account }),
    ]);

    // const mails = await this.inboxModel.find({});
    // for (const mail of mails) {
    //   const participant = {};
    //   if (!mail.emisor.funcionario) {
    //     await this.inboxModel.populate(mail, { path: 'emisor.cuenta' });
    //     if (!mail.emisor.cuenta.funcionario) {
    //       participant['fullname'] = 'NO DESIGNADO';
    //     } else {
    //       const officer = await this.officerModel
    //         .findById(mail.emisor.cuenta.funcionario._id)
    //         .populate('cargo', 'nombre');
    //       participant['fullname'] = [
    //         officer.nombre,
    //         officer.paterno,
    //         officer.materno,
    //       ]
    //         .filter(Boolean)
    //         .join(' ');
    //       if (officer.cargo) {
    //         participant['jobtitle'] = officer.cargo.nombre;
    //       }
    //     }
    //   } else {
    //     const officer = await this.officerModel
    //       .findById(mail.emisor.funcionario._id)
    //       .populate('cargo', 'nombre');
    //     participant['fullname'] = [
    //       officer.nombre,
    //       officer.paterno,
    //       officer.materno,
    //     ]
    //       .filter(Boolean)
    //       .join(' ');
    //     if (officer.cargo) {
    //       participant['jobtitle'] = officer.cargo.nombre;
    //     }
    //   }
    //   await this.inboxModel.findByIdAndUpdate(mail._id, {
    //     emisor: { cuenta: mail.emisor.cuenta._id, ...participant },
    //   });
    //   console.log('ok');
    // }
    // console.log('end');
    return { mails, length };
  }
  async create(inbox: CreateInboxDto, account: Account) {
    const mails = await this.createInboxModel(inbox, account);
    const session = await this.connection.startSession();
    try {
      session.startTransaction();
      await this.inboxModel.findOneAndDelete(
        {
          tramite: inbox.tramite,
          receptor: account._id,
          recibido: { $ne: null },
        },
        { session },
      );
      const [, inMails] = await Promise.all([
        this.outboxModel.insertMany(mails, { session }),
        this.inboxModel.insertMany(mails, { session }),
      ]);
      await this.procedureModel.updateOne(
        { _id: inbox.tramite },
        { send: true },
        { session },
      );
      await session.commitTransaction();
      return await this.inboxModel.populate(inMails, {
        path: 'tramite',
        select: 'alterno detalle estado',
      });
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('No se pudo enviar el tramite');
    } finally {
      session.endSession();
    }
  }

  async aceptMail(id_mail: string) {
    const mailDB = await this.inboxModel
      .findById(id_mail)
      .populate('tramite', 'state');
    if (!mailDB)
      throw new BadRequestException('El envio del tramite ha sido cancelado');
    const session = await this.connection.startSession();
    try {
      session.startTransaction();
      await Promise.all([
        this.outboxModel.updateOne(
          {
            tramite: mailDB.tramite._id,
            'emisor.cuenta': mailDB.emisor.cuenta._id,
            'receptor.cuenta': mailDB.receptor.cuenta._id,
            recibido: null,
          },
          { recibido: true, fecha_recibido: new Date() },
          { session },
        ),
        this.inboxModel.updateOne(
          {
            tramite: mailDB.tramite._id,
            'emisor.cuenta': mailDB.emisor.cuenta._id,
            'receptor.cuenta': mailDB.receptor.cuenta._id,
            recibido: null,
          },
          { recibido: true },
          { session },
        ),
      ]);
      if (mailDB.tramite.state !== 'OBSERVADO')
        await this.procedureModel.findByIdAndUpdate(
          mailDB.tramite._id,
          {
            state: 'EN REVISION',
          },
          { session },
        );
      await session.commitTransaction();
      return true;
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException(
        'Ha ocurrido un error al aceptar el tramite',
      );
    } finally {
      session.endSession();
    }
  }
  async rejectMail(id_mail: string, rejectionReason: string) {
    const mailDB = await this.inboxModel
      .findById(id_mail)
      .populate('tramite', 'state');
    if (!mailDB)
      throw new BadRequestException('El envio del tramite ha sido cancelado');
    const session = await this.connection.startSession();
    try {
      session.startTransaction();
      await Promise.all([
        this.inboxModel.deleteOne({ _id: id_mail }, { session }),
        this.outboxModel.updateOne(
          {
            tramite: mailDB.tramite._id,
            'emisor.cuenta': mailDB.emisor.cuenta._id,
            'receptor.cuenta': mailDB.receptor.cuenta._id,
            recibido: null,
          },
          {
            fecha_recibido: new Date(),
            motivo_rechazo: rejectionReason,
            recibido: false,
          },
          { session },
        ),
      ]);
      const lastMailSend = await this.outboxModel
        .findOne({
          tramite: mailDB.tramite._id,
          'receptor.cuenta': mailDB.emisor.cuenta._id,
          recibido: true,
        })
        .sort({ _id: -1 });
      if (lastMailSend) {
        lastMailSend.recibido = false;
        const newMailOld = new this.inboxModel(lastMailSend);
        await this.inboxModel.updateOne(
          // newMailOld,
          { $setOnInsert: newMailOld },
          { upsert: true },
        );
      } else {
        this.procedureModel.updateMany({});
      }
      await session.commitTransaction();
      return true;
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('No se pudo aceptar el tramite');
    } finally {
      session.endSession();
    }
  }

  async verifyDuplicateSend(id_procedure: string, id_receiver: string) {
    // ! change query for receive procedures distinc emitter
    const foundDuplicate = await this.inboxModel
      .findOne({
        'receptor.cuenta': id_receiver,
        tramite: id_procedure,
      })
      .populate({
        path: 'receptor.cuenta',
        select: 'funcionario',
        populate: {
          path: 'funcionario',
          select: 'nombre paterno materno',
        },
      });
    if (foundDuplicate)
      throw new BadRequestException(
        `El funcionario ${createFullName(
          foundDuplicate.receptor.cuenta.funcionario,
        )} ya tiene el tramite en su bandeja de entrada`,
      );
  }
  async createInboxModel(inbox: CreateInboxDto, account: Account) {
    const { receivers, ...value } = inbox;
    for (const receiver of receivers) {
      await this.verifyDuplicateSend(value.tramite, receiver.cuenta);
    }
    await this.accountModel.populate(account, {
      path: 'funcionario',
      select: 'nombre paterno materno cargo',
      populate: {
        path: 'cargo',
        select: 'nombre',
      },
    });
    const fecha_envio = new Date();
    const { funcionario } = account;
    const emiter = {
      cuenta: account._id,
      fullname: [funcionario.nombre, funcionario.paterno, funcionario.materno]
        .filter(Boolean)
        .join(' '),
      ...(funcionario.cargo && { jobtitle: funcionario.cargo.nombre }),
    };
    const mails = receivers.map((receiver) => {
      return {
        emisor: emiter,
        receptor: receiver,
        fecha_envio,
        ...value,
      };
    });
    return mails;
  }
  async getMail(id_inbox: string) {
    const mail = await this.inboxModel
      .findById(id_inbox)
      .populate('tramite')
      .populate({
        path: 'emisor.cuenta',
        select: 'dependencia',
        populate: {
          path: 'dependencia',
          select: 'nombre',
          populate: {
            path: 'institucion',
            select: 'nombre',
          },
        },
      });
    if (!mail)
      throw new BadRequestException(
        'El envio de este tramite ha sido cancelado',
      );
    return mail;
  }
  async getLocationProcedure(id_procedure: string) {
    return await this.inboxModel
      .find({ tramite: id_procedure })
      .select('receptor')
      .populate({
        path: 'receptor.cuenta',
        select: 'funcionario dependencia',
        populate: [
          {
            path: 'funcionario',
            select: 'nombre paterno materno cargo',
            populate: {
              path: 'cargo',
              select: 'nombre',
            },
          },
          {
            path: 'dependencia',
            select: 'nombre',
          },
        ],
      });
  }
}
