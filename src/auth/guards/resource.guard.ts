import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { META_RESOURCE } from '../decorators';
import { Account } from '../schemas/account.schema';

@Injectable()
export class ResourceGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const validResource: string | undefined = this.reflector.get(
      META_RESOURCE,
      context.getClass(),
    );
    if (!validResource) return true;
    const req = context.switchToHttp().getRequest();
    const account = req.user as Account;
    if (!account)
      throw new InternalServerErrorException(
        'ResourceGuard auth problems or not call, no user in request',
      );
    const permissions = account.rol.permissions.find(
      (permission) => permission.resource === validResource,
    );
    if (!permissions)
      throw new ForbiddenException(
        `Esta cuenta no tiene los permisos necesarios`,
      );
    const methodToActionMap = {
      POST: 'create',
      GET: 'read',
      PUT: 'update',
      DELETE: 'delete',
    };
    return permissions.actions.includes(methodToActionMap[req.method]);
  }
}
