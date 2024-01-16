import { Type } from 'class-transformer';
import { IsBoolean, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

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

  @IsNumber()
  @Type(() => Number)
  dni: number;

  @IsNumber()
  @Type(() => Number)
  telefono: number;

  @IsNotEmpty()
  @IsString()
  direccion: string;

  @IsMongoId()
  @IsOptional()
  cargo?: string;

  @IsBoolean()
  @IsOptional()
  cuenta: boolean;
}
