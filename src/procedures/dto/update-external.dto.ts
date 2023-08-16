import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateExternalProcedureDto } from './create-external.dto';

export class UpdateExternalProcedureDto extends PartialType(
  OmitType(CreateExternalProcedureDto, [
    'type',
    'group',
    'requerimientos',
  ] as const),
) {}
