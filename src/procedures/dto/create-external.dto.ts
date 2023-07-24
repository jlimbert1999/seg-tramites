import { Prop } from "@nestjs/mongoose";
import { Type } from "class-transformer";
import { IsArray, IsDefined, IsEnum, IsNotEmpty, IsNotEmptyObject, IsNumber, IsObject, IsOptional, IsString, ValidateNested } from "class-validator"


export class ApplicantDto {
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
export class RepresentativeDto {
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
    tipo: string;

    @IsString()
    @IsNotEmpty()
    documento?: string;
}
export class CreateExternalProcedureDto {
    @IsString()
    @IsNotEmpty()
    tipo_tramite: string

    @IsOptional()
    @IsDefined()
    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => RepresentativeDto)
    representante: RepresentativeDto

    @IsDefined()
    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => ApplicantDto)
    solicitante: ApplicantDto

    @IsNumber()
    pin: number

    @IsString()
    @IsNotEmpty()
    detalle: string

    @IsString()
    @IsNotEmpty()
    cantidad: string

    @IsArray()
    @IsString({ each: true })
    requerimientos: string[]

    @IsString()
    @IsNotEmpty()
    cite: string
}
