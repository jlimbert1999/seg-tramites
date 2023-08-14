import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Imbox, Outbox } from '../schemas/index';
import { Account } from 'src/administration/schemas';
import { CreateInboxDto } from '../dto/create-inbox.dto';
import { createFullName } from 'src/administration/helpers/fullname';

@Injectable()
export class InboxService {
    constructor(
        @InjectModel(Imbox.name) private inboxModel: Model<Imbox>,
        @InjectModel(Outbox.name) private outboxModel: Model<Outbox>,
        @InjectModel(Account.name) private accountModel: Model<Account>,
        @InjectConnection() private readonly connection: mongoose.Connection
    ) {

    }
    async getAll(id_account: string, limit: number, offset: number) {
        offset = offset * limit
        const [mails, length] = await Promise.all([
            this.inboxModel.find({ 'receptor.cuenta': id_account })
                .sort({ fecha_envio: -1 })
                .skip(offset)
                .limit(limit)
                .populate('tramite', 'alterno detalle estado'),
            this.inboxModel.count({ 'receptor.cuenta': id_account }),
        ]);
        return { mails, length }
    }

    async getAccountForSend(id_dependencie: string, id_account: string) {
        return await this.accountModel.find({
            dependencia: id_dependencie,
            activo: true,
            funcionario: { $ne: null },
            _id: { $ne: id_account }
        })
            .select('_id')
            .populate({
                path: 'funcionario',
                populate: {
                    path: 'cargo',
                    select: 'nombre'
                }
            })
    }

    async create(inbox: CreateInboxDto, account: Account) {
        const mails = await this.createInboxModel(inbox, account)
        const session = await this.connection.startSession();
        try {
            session.startTransaction();
            await this.inboxModel.findOneAndDelete({ tramite: inbox.tramite, receptor: account._id, recibido: { $ne: null } }, { session });
            const [, inMails] = await Promise.all([
                this.outboxModel.insertMany(mails, { session }),
                this.inboxModel.insertMany(mails, { session })
            ])
            await session.commitTransaction();
            return await this.inboxModel.populate(inMails, { path: 'tramite', select: 'alterno detalle estado' })
        } catch (error) {
            await session.abortTransaction();
            throw new InternalServerErrorException('No se puedo enviar en el tramite');
        } finally {
            session.endSession();
        }
    }

    async verifyDuplicateSend(id_procedure: string, group: string, id_receiver: string) {
        // ! change query for receive procedures distinc emitter
        const foundDuplicate = await this.inboxModel.findOne({
            'receptor.cuenta': id_receiver,
            tramite: id_procedure,
            tipo: group
        }).populate({
            path: 'receptor.cuenta',
            select: 'funcionario',
            populate: {
                path: 'funcionario',
                select: 'nombre paterno materno'
            }
        })
        if (foundDuplicate) throw new BadRequestException(`El funcionario ${createFullName(foundDuplicate.receptor.funcionario)} ya tiene el tramite en su bandeja de entrada`)
    }
    async createInboxModel(inbox: CreateInboxDto, account: Account) {
        const { receivers, ...value } = inbox;
        for (const receiver of receivers) {
            await this.verifyDuplicateSend(value.tramite, value.tipo, receiver.cuenta)
        }
        await this.accountModel.populate(account, {
            path: 'funcionario',
            select: 'nombre paterno materno cargo',
            populate: {
                path: 'cargo',
                select: 'nombre'
            }
        });
        const fecha_envio = new Date();
        const { funcionario } = account;
        const emiter = {
            cuenta: account._id,
            fullname: [funcionario.nombre, funcionario.paterno, funcionario.materno].filter(Boolean).join(" "),
            ...funcionario.cargo && { jobtitle: funcionario.cargo.nombre }
        }
        const mails = receivers.map(receiver => {
            return {
                emisor: emiter,
                receptor: receiver,
                fecha_envio,
                ...value
            }
        })
        return mails
    }
}