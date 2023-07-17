import { IsNotEmpty, MinLength } from 'class-validator';
export class UpdateMyAccountDto {
    @MinLength(6)
    @IsNotEmpty()
    password: string
}

