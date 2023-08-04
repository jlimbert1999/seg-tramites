import { Type } from "class-transformer";
import { IsNotEmpty, IsNotEmptyObject, IsObject, IsOptional, IsString, ValidateNested } from "class-validator"

export class Worker {
    @IsString()
    @IsNotEmpty()
    nombre: string;

    @IsString()
    @IsNotEmpty()
    cargo: string;
}

export class CreateInternalProcedureDto {
    @IsString()
    @IsNotEmpty()
    tipo_tramite: string

    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => Worker)
    remitente: Worker

    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => Worker)
    destinatario: Worker

    @IsString()
    @IsNotEmpty()
    detalle: string

    @IsString()
    @IsNotEmpty()
    cantidad: string

    @IsOptional()
    cite: string
}
