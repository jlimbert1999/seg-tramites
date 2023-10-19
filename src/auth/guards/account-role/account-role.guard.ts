import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { META_RESOURCE } from 'src/auth/decorators/rol-protected.decorator';
import { Account } from 'src/auth/schemas/account.schema';

@Injectable()
export class AccountRoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const validResource: string = this.reflector.get(
      META_RESOURCE,
      context.getClass(),
    );
    if (!validResource) return true;
    const req = context.switchToHttp().getRequest();
    const account = req.user as Account;
    if (!account)
      throw new InternalServerErrorException(
        'Guard auth problems or not call, no user in requets',
      );
    const permissions = account.rol.permissions.find(
      (element) => element.resource === validResource,
    );
    if (!permissions)
      throw new ForbiddenException(
        `Esta cuenta no tiene permisos para el recurso solicitado`,
      );
    let allow = false;
    if (req.method == 'POST' && permissions.actions.includes('create'))
      allow = true;
    else if (req.method == 'GET' && permissions.actions.includes('read'))
      allow = true;
    else if (req.method == 'PUT' && permissions.actions.includes('update'))
      allow = true;
    else if (req.method == 'DELETE' && permissions.actions.includes('delete'))
      allow = true;
    return allow;
  }
}
