import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Outbox, Inbox, Procedure } from '../schemas';
import { Account } from 'src/administration/schemas';

@Injectable()
export class CommunicationService {
  constructor(
    @InjectModel(Outbox.name) private outboxModel: Model<Outbox>,
    @InjectModel(Inbox.name) private inboxModel: Model<Inbox>,
    @InjectModel(Account.name) private accountModel: Model<Account>,
    @InjectModel(Procedure.name) private procedureModel: Model<Account>,
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
  async findInboxOfAccount(id_account: string, limit: number, offset: number) {
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
  async findOutboxOfAccount(id_account: string, limit: number, offset: number) {
    const dataPaginated = await this.outboxModel.aggregate([
      {
        $match: {
          'emisor.cuenta': id_account,
        },
      },
      {
        $group: {
          _id: {
            cuenta: '$emisor.cuenta',
            tramite: '$tramite',
            fecha_envio: '$fecha_envio',
          },
          sendings: { $push: '$$ROOT' },
        },
      },
      {
        $lookup: {
          from: 'procedures',
          localField: '_id.tramite',
          foreignField: '_id',
          as: '_id.tramite',
        },
      },
      {
        $unwind: {
          path: '$_id.tramite',
        },
      },
      { $sort: { '_id.fecha_envio': -1 } },
      {
        $facet: {
          paginatedResults: [{ $skip: offset * limit }, { $limit: limit }],
          totalCount: [
            {
              $count: 'count',
            },
          ],
        },
      },
    ]);
    const mails = dataPaginated[0].paginatedResults;
    const length = dataPaginated[0].totalCount[0]
      ? dataPaginated[0].totalCount[0].count
      : 0;
    return { mails, length };
  }
  async getWorkflowOfProcedure(id_procedure: string) {
    const workflow = await this.outboxModel.aggregate([
      {
        $match: {
          tramite: new mongoose.Types.ObjectId(id_procedure),
        },
      },
      {
        $group: {
          _id: {
            cuenta: '$emisor.cuenta',
            fecha_envio: '$fecha_envio',
          },
          sendings: { $push: '$$ROOT' },
        },
      },
      {
        $sort: {
          '_id.fecha_envio': 1,
        },
      },
    ]);
    for (const item of workflow) {
      await this.outboxModel.populate(item['sendings'], [
        {
          path: 'emisor.cuenta',
          select: '_id',
          populate: {
            path: 'dependencia',
            select: 'nombre',
            populate: {
              path: 'institucion',
              select: 'nombre sigla',
            },
          },
        },
        {
          path: 'receptor.cuenta',
          select: '_id',
          populate: {
            path: 'dependencia',
            select: 'nombre',
            populate: {
              path: 'institucion',
              select: 'nombre sigla',
            },
          },
        },
      ]);
    }
    return workflow;
  }
  async cancelSend(id_outbox: string) {
    const mailDB = await this.outboxModel.findById(id_outbox);
    if (!mailDB)
      throw new BadRequestException('No se encontro el envio realizado');
    if (mailDB.recibido !== undefined)
      throw new BadRequestException(
        'Este envio no se puede cancelar porque el tramite ya ha sido evaluado',
      );
    const session = await this.connection.startSession();
    try {
      session.startTransaction();
      await this.outboxModel.deleteOne({ _id: id_outbox }, { session });
      await this.inboxModel.findOneAndDelete(
        {
          tramite: mailDB.tramite._id,
          'emisor.cuenta': mailDB.emisor.cuenta._id,
          'receptor.cuenta': mailDB.receptor.cuenta._id,
          fecha_envio: mailDB.fecha_envio,
        },
        { session },
      );
      const recoveredMail = await this.recoverLastMail(
        mailDB.tramite._id,
        mailDB.emisor.cuenta._id,
        true,
        session,
      );

      await session.commitTransaction();
      return recoveredMail;
    } catch (error) {
      console.log(error);
      await session.abortTransaction();
      throw new InternalServerErrorException(
        'Ha ocurrido un error al cancelar el envio de un tramite',
      );
    } finally {
      await session.endSession();
    }
  }

  async recoverLastMail(
    id_procedure: string,
    id_receiver: string,
    isRejected: boolean,
    session: mongoose.mongo.ClientSession,
  ) {
    const lastMail = await this.outboxModel
      .findOne({
        tramite: id_procedure,
        'receptor.cuenta': id_receiver,
        recibido: true,
      })
      .sort({ _id: -1 });
    if (!lastMail) {
      await this.procedureModel.updateOne(
        { _id: id_procedure },
        { send: false },
        { session },
      );
      return undefined;
    }
    lastMail.recibido = !isRejected;
    const recoverMail = new this.inboxModel(lastMail);
    return await this.inboxModel.findOneAndUpdate(
      {
        tramite: id_procedure,
        'emisor.cuenta': lastMail.emisor.cuenta._id,
        'receptor.cuenta': lastMail.receptor.cuenta._id,
        recibido: false,
      },
      { $setOnInsert: recoverMail },
      { upsert: true, session: session },
    );
  }
}
