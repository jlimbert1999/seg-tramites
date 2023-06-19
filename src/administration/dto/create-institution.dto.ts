import { IsNotEmpty, IsString } from "class-validator"

export class CreateInstitutionDto {
    @IsNotEmpty()
    @IsString()
    nombre: string

    @IsNotEmpty()
    @IsString()
    sigla: string
}
