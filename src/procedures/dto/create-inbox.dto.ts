import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsIn, IsMongoId, IsNotEmpty, IsOptional, IsString, ValidateNested } from "class-validator"
import { procedureGroup } from "../interfaces/group.interface";

class ReceiverDto {
    @IsMongoId()
    cuenta: string;

    @IsString()
    @IsNotEmpty()
    fullname: string;

    @IsString()
    @IsOptional()
    jobtitle?: string;
}


export class CreateInboxDto {
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
    @Type(() => ReceiverDto)
    receivers: ReceiverDto[]

    @IsString()
    @IsOptional()
    numero_interno: string
}