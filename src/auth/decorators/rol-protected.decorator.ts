import { SetMetadata } from '@nestjs/common';
import { ValidResources } from '../interfaces/valid-resources.interface';
export const META_RESOURCE = 'resources'
// insert valid roles in metadata for acces in guards with reflector
export const RoleProtected = (resource: ValidResources) => {
    return SetMetadata(META_RESOURCE, resource)
};