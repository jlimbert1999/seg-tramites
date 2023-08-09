import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsIn, IsMongoId, IsNotEmpty, IsOptional, IsString, ValidateNested } from "class-validator"
import { procedureGroup } from "../interfaces/group.interface";


class ReceriverDto {
    @IsMongoId()
    cuenta: string;

    @IsString()
    @IsNotEmpty()
    fullname: string;

    @IsString()
    @IsOptional()
    jobtitle?: string;
}


export class InboxDto {
    @IsMongoId()
    tramite: string

    @IsIn(Object.values(procedureGroup))
    tipo: procedureGroup

    @IsString()
    @IsNotEmpty()
    cantidad: string

    @IsString()
    @IsNotEmpty()
    motivo: string

    @IsArray()
    @ValidateNested({ each: true })
    @ArrayMinSize(1)
    @Type(() => ReceriverDto)
    receivers: ReceriverDto[]

    @IsString()
    @IsOptional()
    numero_interno: string
}
