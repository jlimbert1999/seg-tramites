import { IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { statusMail } from 'src/procedures/interfaces';

export class searchProcedureByUnitDto {
  @IsEnum(Object.values(statusMail))
  @IsOptional()
  status?: statusMail;

  @IsMongoId()
  @IsOptional()
  account?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  start?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  end?: string;
}
