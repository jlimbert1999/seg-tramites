import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Imbox, Outbox } from '../schemas/index';
import { Model } from 'mongoose';
import { Account, Officer } from 'src/administration/schemas';

@Injectable()
export class ImboxService {
    constructor(
        @InjectModel(Imbox.name) private imboxModel: Model<Imbox>,
        @InjectModel(Outbox.name) private outboxModel: Model<Outbox>,
        @InjectModel(Officer.name) private officer: Model<Officer>,
        @InjectModel(Account.name) private accountModel: Model<Account>
    ) {

    }
    async getAll(id_account: string, limit: number, offset: number) {
        const [mails, length] = await Promise.all([
            this.imboxModel.find({ 'receptor.cuenta': id_account })
                .sort({ fecha_envio: -1 })
                .skip(offset)
                .limit(2)
                .populate('tramite'),
            this.imboxModel.count({ 'receptor.cuenta': id_account }),
        ]);
        console.log(mails);
        return { mails, length }
    }
}
