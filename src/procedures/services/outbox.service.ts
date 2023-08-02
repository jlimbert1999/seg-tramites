import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Outbox } from '../schemas';
import { Account, Officer } from 'src/administration/schemas';

@Injectable()
export class OutboxService {
    constructor(
        @InjectModel(Outbox.name) private outboxModel: Model<Outbox>,
        @InjectModel(Officer.name) private officer: Model<Officer>,
        @InjectModel(Account.name) private accountModel: Model<Account>,

    ) { }

    async getAll(id_account: string, limit: number, offset: number) {
        const dataPaginated = await this.outboxModel.aggregate([
            {
                $match: {
                    "emisor.cuenta": id_account
                }
            },
            {
                $group: {
                    _id: {
                        'cuenta': '$emisor.cuenta',
                        'tramite': '$tramite',
                        'tipo': '$tipo',
                        'fecha_envio': '$fecha_envio'
                    },
                    sendings: { $push: "$$ROOT" }
                }
            },
            { $sort: { '_id.fecha_envio': -1 } },
            {
                $facet: {
                    paginatedResults: [{ $skip: offset }, { $limit: limit }],
                    totalCount: [
                        {
                            $count: 'count'
                        }
                    ]
                }
            },
        ])

        // for (const mail of dataPaginated[0].paginatedResults) {
        //     await SalidaModel.populate(mail.sendings, [
        //         { path: 'receptor.funcionario', select: 'nombre paterno materno cargo' },
        //         { path: 'tramite', select: 'alterno estado cite detalle' }
        //     ])
        // }
        const mails = dataPaginated[0].paginatedResults
        mails.forEach(element => {
            console.log(element);
        });
        const length = dataPaginated[0].totalCount[0] ? dataPaginated[0].totalCount[0].count : 0
        // const mails = await this.outboxModel.find({})
        // for (const mail of mails) {
        //     const participant = {}
        //     if (!mail.receptor.funcionario) {
        //         await this.outboxModel.populate(mail, { path: 'receptor.cuenta' })
        //         if (!mail.receptor.cuenta.funcionario) {
        //             participant['fullname'] = 'NO DESIGNADO'
        //         }
        //         else {
        //             const officer = await this.officer.findById(mail.receptor.cuenta.funcionario._id).populate('cargo', 'nombre')
        //             participant['fullname'] = [officer.nombre, officer.paterno, officer.materno].filter(Boolean).join(" ")
        //             if (officer.cargo) {
        //                 participant['jobtitle'] = officer.cargo.nombre
        //             }
        //         }
        //     }
        //     else {
        //         const officer = await this.officer.findById(mail.receptor.funcionario._id).populate('cargo', 'nombre')
        //         participant['fullname'] = [officer.nombre, officer.paterno, officer.materno].filter(Boolean).join(" ")
        //         if (officer.cargo) {
        //             participant['jobtitle'] = officer.cargo.nombre
        //         }
        //     }
        //     await this.outboxModel.findByIdAndUpdate(mail._id, { receptor: { cuenta: mail.receptor.cuenta._id, ...participant } })
        //     console.log('ok');
        // }
        // console.log('end');
        return { mails: [], length: 0 }
    }

    async getWorkflow(id_procedure: string) {
        const workflow = await this.outboxModel.aggregate([
            {
                $match: {
                    "tramite": new mongoose.Types.ObjectId(id_procedure)
                }
            },
            {
                $group: {
                    _id: {
                        'cuenta': '$emisor.cuenta',
                        'tipo': '$tipo',
                        'fecha_envio': '$fecha_envio'
                    },
                    sendings: { $push: "$$ROOT" }
                }
            },
            {
                $sort: {
                    '_id.fecha_envio': 1
                }
            }
        ]);
        for (const item of workflow) {
            await this.accountModel.populate(item['sendings'], [
                {
                    path: 'emisor.cuenta',
                    select: '_id',
                    populate: {
                        path: 'dependencia',
                        select: 'nombre',
                        populate: {
                            path: 'institucion',
                            select: 'nombre'
                        }
                    }
                },
                {
                    path: 'receptor.cuenta',
                    select: '_id',
                    populate: {
                        path: 'dependencia',
                        select: 'nombre',
                        populate: {
                            path: 'institucion',
                            select: 'nombre'
                        }
                    }
                }
            ])
        }
        return workflow
    }
}
