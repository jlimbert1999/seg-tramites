import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateDependencyDto } from '../dependency.dto';

export class UpdateDependencyDto extends PartialType(OmitType(CreateDependencyDto, ['institucion'] as const)) {
  activo: boolean;
}
