import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString, ValidateNested } from "class-validator";

export class CreateRequirementDto {
    @IsNotEmpty()
    @IsString()
    nombre: string;

    @IsBoolean()
    @IsOptional()
    activo: boolean
}

export class CreateTypeProcedureDto {
    @IsNotEmpty()
    @IsString()
    nombre: string;

    @IsNotEmpty()
    @IsString()
    segmento: string;

    @IsNotEmpty()
    @IsString()
    tipo: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateRequirementDto)
    requerimientos: CreateRequirementDto[]
}



