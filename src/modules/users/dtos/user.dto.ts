import { PartialType } from '@nestjs/mapped-types';
import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  fullname: string;

  @IsNotEmpty()
  @IsString()
  login: string;

  @IsNotEmpty()
  password: string;

  @IsMongoId()
  rol: string;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}
