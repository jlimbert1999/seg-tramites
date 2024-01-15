import { CanActivate, ExecutionContext, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { META_PERMISSION } from '../decorators';
import { permission } from '../interfaces';
import { Account } from 'src/users/schemas';

@Injectable()
export class ActionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const validPermission: permission = this.reflector.get(META_PERMISSION, context.getHandler());
    const req = context.switchToHttp().getRequest();
    const account = req.user as Account;
    if (!account) throw new InternalServerErrorException('ActionGuard error, user not found in request');
    return account.rol.permissions.some((el) => el.resource === validPermission.resource);
  }
}
