import { SetMetadata, UseGuards, applyDecorators } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ActionGuard } from '../guards/action.guard';
import { permission } from '../interfaces';
export const META_PERMISSION = 'permissions';

export function Permission(permissions: permission) {
  return applyDecorators(SetMetadata(META_PERMISSION, permissions), UseGuards(ActionGuard));
}
