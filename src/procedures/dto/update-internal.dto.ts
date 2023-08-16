import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateInternalProcedureDto } from './create-internal.dto';

export class UpdateInternalProcedureDto extends PartialType(
  OmitType(CreateInternalProcedureDto, ['type'] as const),
) { }
