import { CanActivate, ExecutionContext, ForbiddenException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Account } from 'src/administration/schemas/account.schema';
import { META_RESOURCE } from 'src/auth/decorators/rol-protected.decorator';

@Injectable()
export class AccountRoleGuard implements CanActivate {

  constructor(
    private readonly reflector: Reflector) { }

  canActivate(
    context: ExecutionContext,
  ): boolean {
    const validResource: string = this.reflector.get(META_RESOURCE, context.getClass())
    if (!validResource) return true
    const req = context.switchToHttp().getRequest();
    const account = req.user as Account;
    if (!account) throw new InternalServerErrorException('Guard Auth problems or not call, no user in requets')
    const privilege = account.rol.privileges.find(element => element.resource === validResource)
    if (!privilege) throw new ForbiddenException(`Esta cuenta no tiene permisos para el recurso ${validResource}`)
    let allow = false;
    if (req.method == "POST" && privilege.create) allow = true;
    else if (req.method == "GET" && privilege.read) allow = true;
    else if (req.method == "PUT" && privilege.update) allow = true;
    else if (req.method == "DELETE" && privilege.delete) allow = true;
    return allow;
  }
}
