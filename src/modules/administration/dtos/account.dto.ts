import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { OmitType, PartialType } from '@nestjs/mapped-types';
import { PaginationDto } from 'src/common';

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

  @IsOptional()
  @IsMongoId()
  funcionario?: string;
}

export class UpdateAccountDto extends PartialType(
  OmitType(CreateAccountDto, ['dependencia'] as const),
) {}

export class FilterAccountDto extends PaginationDto {
  dependency: string;
}
