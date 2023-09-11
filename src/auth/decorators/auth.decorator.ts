import { UseGuards, applyDecorators } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RoleProtected } from './rol-protected.decorator';
import { validResources } from '../interfaces/valid-resources.interface';
import { AccountRoleGuard } from '../guards/account-role/account-role.guard';

export function Auth(resource?: validResources) {
  return applyDecorators(
    RoleProtected(resource),
    UseGuards(AuthGuard(), AccountRoleGuard),
  );
}
