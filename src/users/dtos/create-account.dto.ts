import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAccountDto {
  @IsNotEmpty()
  @IsString()
  login: string;

  @IsNotEmpty()
  password: string;

  @IsMongoId()
  dependencia: string;

  @IsMongoId()
  rol: string;
}
