import { SetMetadata, UseGuards, applyDecorators } from '@nestjs/common';
import { validResource } from '../interfaces';
import { ResourceGuard } from '../guards';

export const META_RESOURCE = 'resource';
export function ResourceProtected(resource: validResource) {
  return applyDecorators(SetMetadata(META_RESOURCE, resource), UseGuards(ResourceGuard));
}
