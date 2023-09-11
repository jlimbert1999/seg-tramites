import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateProcedureDto } from './procedure-create.dto';

export class UpdateProcedureDto extends PartialType(
  OmitType(CreateProcedureDto, ['type'] as const),
) {}
