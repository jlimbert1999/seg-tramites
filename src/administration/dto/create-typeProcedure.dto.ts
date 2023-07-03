import { Type } from "class-transformer";
import { IsArray, IsNotEmpty, IsString, ValidateNested } from "class-validator";

class CreateRequirementDto {
    @IsNotEmpty()
    @IsString()
    nombre: string;
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



