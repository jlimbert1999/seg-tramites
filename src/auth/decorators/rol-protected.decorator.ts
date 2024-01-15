import { SetMetadata } from '@nestjs/common';
import { validResource } from '../interfaces/valid-resources.enum';
export const META_RESOURCE = 'resource';
// ! insert valid roles in metadata for access in guards with reflector
export const RoleProtected = (resource: validResource) => {
  return SetMetadata(META_RESOURCE, resource);
};
