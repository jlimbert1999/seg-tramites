import { PartialType } from '@nestjs/mapped-types';
import { CreateTypeProcedureDto } from './create-typeProcedure.dto';

export class UpdateTypeProcedureDto extends PartialType(CreateTypeProcedureDto) { }
