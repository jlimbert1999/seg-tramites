import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNotEmptyObject,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ProcedureDto } from './procedure.dto';
import { OmitType, PartialType } from '@nestjs/mapped-types';

export class Worker {
  @IsString()
  @IsNotEmpty()
  fullanem: string;

  @IsString()
  @IsNotEmpty()
  jobtitle: string;
}

export class CreateInternalProcedureDto extends ProcedureDto {
  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => Worker)
  emitter: Worker;

  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => Worker)
  receiver: Worker;
}
export class UpdateInternalProcedureDto extends PartialType(
  OmitType(CreateInternalProcedureDto, ['segment', 'type'] as const),
) {}
