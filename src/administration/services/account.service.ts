import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Account } from '../schemas/account.schema';
import { Model } from 'mongoose';

@Injectable()
export class AccountService {
    constructor(
        @InjectModel(Account.name) private accountModel: Model<Account>
    ) {
    }

    async findAll(limit: number, offset: number) {
        offset = offset * limit
        const [accounts, length] = await Promise.all(
            [
                this.accountModel.find({ _id: { $ne: process.env.ID_ROOT } }, { password: 0 })
                    .skip(offset)
                    .limit(limit)
                    .sort({ _id: -1 })
                    .populate('dependencia')
                    .populate('funcionario'),
                this.accountModel.count({ _id: { $ne: process.env.ID_ROOT } })
            ]
        )
        return { accounts, length }
    }
}
