import { UseGuards, applyDecorators } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RoleProtected } from './rol-protected.decorator';
import { validResource } from '../interfaces/valid-resources.enum';
import { ResourceGuard } from '../guards/resource.guard';

export function Auth(resource?: validResource) {
  return applyDecorators(RoleProtected(resource), UseGuards(AuthGuard(), ResourceGuard));
}
