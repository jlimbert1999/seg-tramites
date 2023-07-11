import { IsMongoId, IsNotEmpty, IsOptional, IsString } from "class-validator"

export class CreateAccountDto {

    @IsNotEmpty()
    @IsString()
    login: string

    @IsNotEmpty()
    @IsString()
    password: string

    @IsMongoId()
    dependencia: string

    @IsMongoId()
    rol: string

    @IsMongoId()
    @IsOptional()
    funcionario?: string
}
