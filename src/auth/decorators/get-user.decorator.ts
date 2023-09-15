import {
  ExecutionContext,
  InternalServerErrorException,
  createParamDecorator,
} from '@nestjs/common';
import { Account } from 'src/administration/schemas';

// extract user nested by strategy method in request
export const GetUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    const user = req.user as Account;
    if (!user)
      throw new InternalServerErrorException('User not found (requets)');
    return !data ? user : user[data];
  },
);
