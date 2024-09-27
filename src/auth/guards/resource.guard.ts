import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { META_RESOURCE } from '../decorators';
import { VALID_RESOURCES } from '../constants';
import { Account } from 'src/modules/administration/schemas';

@Injectable()
export class ResourceGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const validResource: VALID_RESOURCES | undefined = this.reflector.get(META_RESOURCE, context.getClass());
    if (!validResource) return true;
    const req = context.switchToHttp().getRequest();
    const account: Account = req['user'];
    if (!account) throw new InternalServerErrorException('ResourceGuard error, no user in request');
    const permissions = account.rol.permissions.find((permission) => permission.resource === validResource);
    if (!permissions) throw new ForbiddenException(`Esta cuenta no tiene los permisos necesarios.`);
    const methodToActionMap = {
      PATCH: 'update',
      POST: 'create',
      GET: 'read',
      PUT: 'update',
      DELETE: 'delete',
    };
    return permissions.actions.includes(methodToActionMap[req.method]);
  }
}
