import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsEnum, IsNotEmpty, IsString, ValidateNested } from 'class-validator';

export class CreateRequirementDto {
  @IsNotEmpty()
  @IsString()
  nombre: string;

  @IsBoolean()
  activo: boolean;
}

export class CreateTypeProcedureDto {
  @IsNotEmpty()
  @IsString()
  nombre: string;

  @IsNotEmpty()
  @IsString()
  segmento: string;

  @IsNotEmpty()
  @IsEnum(['EXTERNO', 'INTERNO'])
  tipo: 'EXTERNO' | 'INTERNO';

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRequirementDto)
  requerimientos: CreateRequirementDto[];
}
