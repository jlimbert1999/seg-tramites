import {
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { OmitType, PartialType } from '@nestjs/mapped-types';
import { PaginationDto } from 'src/common';
import { CreateUserDto } from 'src/modules/users/dtos';

export class CreateAccountDto {
  @IsMongoId()
  dependencia: string;

  @IsNotEmpty()
  @IsString()
  jobtitle: string;
}

export class AssingAccountDto extends CreateUserDto {
  @IsString()
  @IsNotEmpty()
  jobtitle: string;

  @IsMongoId()
  officer: string;

  @IsMongoId()
  dependency: string;

  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;
}

export class UpdateAccountDto extends PartialType(
  OmitType(AssingAccountDto, ['dependency'] as const),
) {}

export class FilterAccountDto extends PaginationDto {
  dependency: string;
}
