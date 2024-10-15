import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { User } from 'src/modules/users/schemas';
import { META_RESOURCE } from '../decorators';
import { SystemResource } from '../constants';

@Injectable()
export class ResourceGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const validResource: SystemResource | undefined = this.reflector.get(META_RESOURCE, context.getClass());
    if (!validResource) return true;
    const req = context.switchToHttp().getRequest();
    const user: User = req['user'];
    if (!user) throw new InternalServerErrorException('ResourceGuard error, no user in request');
    const permissions = user.role.permissions.find((permission) => permission.resource === validResource);
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
