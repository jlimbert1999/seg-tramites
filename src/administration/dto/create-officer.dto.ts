import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator"

export class CreateOfficerDto {

    @IsNotEmpty()
    @IsString()
    nombre: string

    @IsNotEmpty()
    @IsString()
    paterno: string

    @IsOptional()
    @IsString()
    materno: string

    @IsNotEmpty()
    dni: string

    @IsNotEmpty()
    telefono: string

    @IsNotEmpty()
    @IsString()
    direccion: string

    @IsNotEmpty()
    @IsString()
    @IsOptional()
    cargo?: string

    @IsBoolean()
    @IsOptional()
    cuenta: boolean

    @IsOptional()
    imageUrl?: string

}

