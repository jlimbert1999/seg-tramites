import { SetMetadata, UseGuards, applyDecorators } from '@nestjs/common';
import { ResourceGuard } from '../guards';
import { SystemResource } from '../constants';

export const META_RESOURCE = 'resource';
export function ResourceProtected(resource: SystemResource) {
  return applyDecorators(SetMetadata(META_RESOURCE, resource), UseGuards(ResourceGuard));
}
