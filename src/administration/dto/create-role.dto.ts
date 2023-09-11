import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';

class Permissions {
  @IsString()
  @IsNotEmpty()
  resource: string;

  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  actions: string[];
}

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
