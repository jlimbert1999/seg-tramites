import { Type } from 'class-transformer';
import {
  IsArray,
  IsDefined,
  IsNotEmpty,
  IsNotEmptyObject,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class ApplicantDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsOptional()
  paterno?: string;

  @IsString()
  @IsOptional()
  materno?: string;

  @IsNotEmpty()
  telefono: string;

  @IsOptional()
  dni?: string;

  @IsString()
  @IsNotEmpty()
  tipo: string;

  @IsString()
  @IsOptional()
  documento?: string;
}

class RepresentativeDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  paterno: string;

  @IsString()
  materno: string;

  @IsNotEmpty()
  telefono: string;

  @IsNotEmpty()
  dni: string;

  @IsString()
  @IsNotEmpty()
  documento?: string;
}

export class CreateExternalDetailDto {
  @IsOptional()
  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => RepresentativeDto)
  representante?: RepresentativeDto;

  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => ApplicantDto)
  solicitante: ApplicantDto;

  @IsArray()
  @IsString({ each: true })
  requirements: string[];

  @IsNumber()
  pin: number;
}
