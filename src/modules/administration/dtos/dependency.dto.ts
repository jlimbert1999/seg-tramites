import { OmitType, PartialType } from '@nestjs/mapped-types';
import {
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateDependencyDto {
  @IsNotEmpty()
  @IsString()
  nombre: string;

  @IsNotEmpty()
  @IsString()
  sigla: string;

  @IsNotEmpty()
  @IsString()
  codigo: string;

  @IsMongoId()
  institucion: string;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}

export class UpdateDependencyDto extends PartialType(
  OmitType(CreateDependencyDto, ['institucion'] as const),
) {}
