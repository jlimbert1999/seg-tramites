import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsBoolean, IsNotEmpty, IsString, ValidateNested } from "class-validator"

export class CreateRoleDto {
    @IsNotEmpty()
    @IsString()
    role: string

    @IsArray()
    @ValidateNested({ each: true })
    @ArrayMinSize(1)
    @Type(() => Privileges)
    privileges: Privileges[]
}


class Privileges {
    @IsString()
    @IsNotEmpty()
    resource: string;

    @IsBoolean()
    create: boolean

    @IsBoolean()
    update: boolean

    @IsBoolean()
    read: boolean

    @IsBoolean()
    delete: boolean

}
