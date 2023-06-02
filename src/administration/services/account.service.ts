import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Account } from '../schemas/account.schema';
import { Model } from 'mongoose';

@Injectable()
export class AccountService {
    constructor(@InjectModel(Account.name) private accountModel: Model<Account>) {

    }

    async findByLogin(login: string) {
        return await this.accountModel.findOne({ login }).populate('rol')
    }
}
