import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateOfficerDto {
  @IsNotEmpty()
  @IsString()
  nombre: string;

  @IsNotEmpty()
  @IsString()
  paterno: string;

  @IsOptional()
  @IsString()
  materno?: string;

  @IsString()
  @IsNotEmpty()
  dni: string;

  @IsNumber()
  @Type(() => Number)
  telefono: number;

  @IsMongoId()
  @IsOptional()
  cargo?: string;

  @IsBoolean()
  @IsOptional()
  cuenta: boolean;
}

export class UpdateOfficerDto extends PartialType(CreateOfficerDto) {}
