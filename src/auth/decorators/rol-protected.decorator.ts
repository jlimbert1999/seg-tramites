import { SetMetadata } from '@nestjs/common';
import { validResources } from '../interfaces/valid-resources.interface';
export const META_RESOURCE = 'resources';
// insert valid roles in metadata for acces in guards with reflector
export const RoleProtected = (resource: validResources) => {
  return SetMetadata(META_RESOURCE, resource);
};
