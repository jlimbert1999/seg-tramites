import { CreateTypeProcedureDto } from './create-typeProcedure.dto';
import { OmitType, PartialType } from '@nestjs/mapped-types';

export class UpdateTypeProcedureDto extends PartialType(
  OmitType(CreateTypeProcedureDto, ['segmento', 'tipo'] as const),
) {}
