import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Imbox } from '../schemas/index';
import { Model } from 'mongoose';
import { Account, Officer } from 'src/administration/schemas';
import { InboxDto } from '../dto/create-inbox.dto';

@Injectable()
export class InboxService {
    constructor(
        @InjectModel(Imbox.name) private imboxModel: Model<Imbox>,
        @InjectModel(Account.name) private accountModel: Model<Account>
    ) {

    }
    async getAll(id_account: string, limit: number, offset: number) {
        offset = offset * limit
        const [mails, length] = await Promise.all([
            this.imboxModel.find({ 'receptor.cuenta': id_account })
                .sort({ fecha_envio: -1 })
                .skip(offset)
                .limit(limit)
                .populate('tramite', 'alterno detalle estado'),
            this.imboxModel.count({ 'receptor.cuenta': id_account }),
        ]);
        return { mails, length }
    }

    async getAccountForSend(id_dependencie: string) {
        return await this.accountModel.find({ dependencia: id_dependencie, activo: true, funcionario: { $ne: null } })
            .select('_id')
            .populate({
                path: 'funcionario',
                populate: {
                    path: 'cargo',
                    select: 'nombre'
                }
            })
    }

    async create(inbox: InboxDto, account: Account) {
        const { receivers, ...value } = inbox
        // const emitter = account.funcionario.cargo ? {
        //     cuenta: account._id,
        //     fullname: this.createFullName(account.funcionario),
        //     jobtitle: account.funcionario.cargo
        // }

        // const fecha_registro = new Date()
        // const sends = receivers.map(receiver => {
        //     return {
        //         ...value,
        //         fecha_registro,
        //         emisor: {
        //             cuenta: account._id,
        //             fullname: account.funcionario.nombre,
        //         }
        //     }
        // })

    }
    createFullName(officer: Officer): string {
        return [officer.nombre, officer.paterno, officer.materno].filter(Boolean).join(" ");
    }
}
