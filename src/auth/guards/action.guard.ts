import { CanActivate, ExecutionContext, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Account } from '../schemas/account.schema';
import { META_PERMISSION } from '../decorators';
import { permission } from '../interfaces';

@Injectable()
export class ActionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const validPermission: permission = this.reflector.get(META_PERMISSION, context.getHandler());
    const req = context.switchToHttp().getRequest();
    const account = req.user as Account;
    if (!account) throw new InternalServerErrorException('ActionGuard error, call Auth in controller');
    return account.rol.permissions.some((el) => el.resource === validPermission.resource);
  }
}