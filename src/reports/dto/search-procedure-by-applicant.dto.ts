import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SearchProcedureByApplicantDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  nombre?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  paterno?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  materno?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  telefono?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  dni?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  tipo?: string;
}
