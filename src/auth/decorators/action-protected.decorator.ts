import { SetMetadata } from '@nestjs/common';
export const META_PERMISSION = 'permissions';

export const ActionProtected = (...permissions: { resource: string; actions: string[] }[]) =>
  SetMetadata(META_PERMISSION, permissions);
