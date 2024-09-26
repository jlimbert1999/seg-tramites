import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsEnum, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { VALID_RESOURCES } from 'src/auth/constants';

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

class Permissions {
  @IsEnum(VALID_RESOURCES)
  resource: VALID_RESOURCES;

  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  actions: string[];
}
