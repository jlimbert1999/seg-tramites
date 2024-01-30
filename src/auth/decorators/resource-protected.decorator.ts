import { SetMetadata, UseGuards, applyDecorators } from '@nestjs/common';
import { ResourceGuard } from '../guards';
import { VALID_RESOURCES } from '../constants';

export const META_RESOURCE = 'resource';
export function ResourceProtected(resource: VALID_RESOURCES) {
  return applyDecorators(SetMetadata(META_RESOURCE, resource), UseGuards(ResourceGuard));
}
