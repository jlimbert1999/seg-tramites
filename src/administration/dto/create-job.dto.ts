import { IsNotEmpty, IsString } from "class-validator"

export class CreateJobDto {
    @IsNotEmpty()
    @IsString()
    nombre: string

    @IsNotEmpty()
    @IsString()
    superior: string
}
