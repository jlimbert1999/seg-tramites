import { IsMongoId, IsNotEmpty, IsString } from "class-validator"

export class CreateDependencyDto {
    @IsNotEmpty()
    @IsString()
    nombre: string

    @IsNotEmpty()
    @IsString()
    sigla: string

    @IsNotEmpty()
    @IsString()
    codigo: string

    @IsMongoId()
    institucion: string
}
