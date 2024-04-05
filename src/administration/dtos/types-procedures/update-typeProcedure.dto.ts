import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateTypeProcedureDto } from './create-typeProcedure.dto';

export class UpdateTypeProcedureDto extends PartialType(
  OmitType(CreateTypeProcedureDto, ['segmento', 'tipo'] as const),
) {}
