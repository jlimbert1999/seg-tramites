import { PartialType } from '@nestjs/mapped-types';
import { Transform, TransformFnParams } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateInstitutionDto {
  @IsNotEmpty()
  @IsString()
  nombre: string;

  @IsNotEmpty()
  @IsString()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  sigla: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
  
}

export class UpdateInstitutionDto extends PartialType(CreateInstitutionDto) {}
