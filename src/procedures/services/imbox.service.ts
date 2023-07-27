import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Imbox } from '../schemas';
import { Model } from 'mongoose';
import { Account, Officer } from 'src/administration/schemas';

@Injectable()
export class ImboxService {
    constructor(
        @InjectModel(Imbox.name) private imboxModel: Model<Imbox>,
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
        // const mails = await this.imboxModel.find({})
        // for (const mail of mails) {
        //     const participant = {}
        //     if (!mail.emisor.funcionario) {
        //         await this.imboxModel.populate(mail, { path: 'emisor.cuenta' })
        //         if (!mail.emisor.cuenta.funcionario) {
        //             participant['fullname'] = 'NO DESIGNADO'
        //         }
        //         else {
        //             const officer = await this.officer.findById(mail.emisor.cuenta.funcionario._id).populate('cargo', 'nombre')
        //             participant['fullname'] = [officer.nombre, officer.paterno, officer.materno].filter(Boolean).join(" ")
        //             if (officer.cargo) {
        //                 participant['jobtitle'] = officer.cargo.nombre
        //             }
        //         }
        //     }
        //     else {
        //         const officer = await this.officer.findById(mail.emisor.funcionario._id).populate('cargo', 'nombre')
        //         participant['fullname'] = [officer.nombre, officer.paterno, officer.materno].filter(Boolean).join(" ")
        //         if (officer.cargo) {
        //             participant['jobtitle'] = officer.cargo.nombre
        //         }
        //     }
        //     await this.imboxModel.findByIdAndUpdate(mail._id, { emisor: { cuenta: mail.emisor.cuenta._id, ...participant } })
        //     console.log('ok');
        // }
        // console.log('end');
        return { mails: [], length: 0 }
    }
}
