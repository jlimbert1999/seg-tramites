import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsNotEmpty, IsString, ValidateNested } from "class-validator"

export class CreateInstitutionDto {
    @IsNotEmpty()
    @IsString()
    role: string

    @IsNotEmpty()
    @IsString()
    @ValidateNested({ each: true })
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
