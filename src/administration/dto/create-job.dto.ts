import { IsNotEmpty, IsOptional, IsString } from "class-validator"

export class CreateJobDto {
    @IsNotEmpty()
    @IsString()
    nombre: string

    @IsNotEmpty()
    @IsString()
    @IsOptional()
    superior: string
}
