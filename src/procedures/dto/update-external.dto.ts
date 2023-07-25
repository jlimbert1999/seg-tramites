import { Type } from "class-transformer"
import { IsOptional, IsDefined, IsNotEmptyObject, IsObject, ValidateNested, IsString, IsNotEmpty } from "class-validator"
import { RepresentativeDto, ApplicantDto } from "./create-external.dto"

export class UpdateExternalProcedureDto {

    @IsOptional()
    @IsDefined()
    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => RepresentativeDto)
    representante: RepresentativeDto

    @IsDefined()
    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => ApplicantDto)
    solicitante: ApplicantDto

    @IsString()
    @IsNotEmpty()
    detalle: string

    @IsString()
    @IsNotEmpty()
    cantidad: string

    @IsString()
    @IsNotEmpty()
    cite: string
}
