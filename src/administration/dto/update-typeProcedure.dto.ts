import { IsArray, IsNotEmpty, IsString, ValidateNested } from "class-validator";
import { CreateRequirementDto } from "./create-typeProcedure.dto";
import { Type } from "class-transformer";

export class UpdateTypeProcedureDto {
    @IsNotEmpty()
    @IsString()
    nombre: string;

    @IsNotEmpty()
    @IsString()
    segmento: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateRequirementDto)
    requerimientos: CreateRequirementDto[]
}

