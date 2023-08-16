import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNotEmptyObject,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ProcedureDto } from './procedure.dto';
import { IntersectionType } from '@nestjs/mapped-types';

export class Worker {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  cargo: string;
}

export class InternalDetailDto {
  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => Worker)
  remitente: Worker;

  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => Worker)
  destinatario: Worker;
}

export class CreateInternalProcedureDto extends IntersectionType(
  ProcedureDto,
  InternalDetailDto,
) {}
