import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';
import { SystemResource } from 'src/auth/constants';

export class CreateRoleDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => Permissions)
  permissions: Permissions[];
}

export class UpdateRoleDto extends PartialType(CreateRoleDto) {}

class Permissions {
  @IsEnum(SystemResource)
  resource: SystemResource;

  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  actions: string[];
}
