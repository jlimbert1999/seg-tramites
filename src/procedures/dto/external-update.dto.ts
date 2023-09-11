import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateExternalDetailDto } from './external-create.dto';

export class UpdateExternalDto extends PartialType(
  OmitType(CreateExternalDetailDto, ['pin', 'requerimientos'] as const),
) {}
