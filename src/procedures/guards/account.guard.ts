import {
  Injectable,
  CanActivate,
  ExecutionContext,
  InternalServerErrorException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Account } from 'src/modules/administration/schemas';
import { User } from 'src/modules/users/schemas';

@Injectable()
export class AccountGuard implements CanActivate {
  constructor(
    @InjectModel(Account.name) private accountModel: Model<Account>,
  ) {}
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const user: User = request['user'];
    if (!user) {
      throw new InternalServerErrorException('User is not authenticated');
    }
    const account = await this.accountModel
      .findOne({ user: user._id })
      .populate('funcionario dependencia');
    if (!account) {
      throw new ForbiddenException(`La cuenta no existe`);
    }
    if (!account.funcionario) {
      throw new ForbiddenException(`La cuenta no esta asignada`);
    }
    request['account'] = account;
    return true;
  }
}
