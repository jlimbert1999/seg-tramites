import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Imbox, Outbox } from '../schemas';
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
                .limit(limit)
                .populate({
                    path: "tramite",
                    select: "alterno estado detalle",
                })
                .populate({
                    path: "emisor.funcionario",
                    select: "nombre paterno materno cargo",
                }),
            this.imboxModel.count({ 'receptor.cuenta': id_account }),
        ]);
        // const mails = await this.outboxModel.find({})
        // for (const mail of mails) {
        //     const participant = {}
        //     if (!mail.receptor.funcionario) {
        //         await this.outboxModel.populate(mail, { path: 'receptor.cuenta' })
        //         if (!mail.receptor.cuenta.funcionario) {
        //             participant['fullname'] = 'NO DESIGNADO'
        //         }
        //         else {
        //             const officer = await this.officer.findById(mail.receptor.cuenta.funcionario._id).populate('cargo', 'nombre paterno materno')
        //             participant['fullname'] = [officer.nombre, officer.paterno, officer.materno].filter(Boolean).join(" ")
        //             if (officer.cargo) {
        //                 participant['jobtitle'] = officer.cargo.nombre
        //             }
        //         }
        //     }
        //     else {
        //         const officer = await this.officer.findById(mail.receptor.funcionario._id).populate('cargo', 'nombre paterno materno')
        //         participant['fullname'] = [officer.nombre, officer.paterno, officer.materno].filter(Boolean).join(" ")
        //         if (officer.cargo) {
        //             participant['jobtitle'] = officer.cargo.nombre
        //         }
        //     }
        //     await this.outboxModel.findByIdAndUpdate(mail._id, { receptor: { cuenta: mail.receptor.cuenta._id, ...participant } })
        //     console.log('ok');
        // }
        // console.log('end');
        return { mails, length }
    }
}
