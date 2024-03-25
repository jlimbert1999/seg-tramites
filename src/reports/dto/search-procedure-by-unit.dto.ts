import { IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { StatusMail } from 'src/procedures/interfaces';

export class searchProcedureByUnitDto {
  @IsEnum(Object.values(StatusMail))
  @IsOptional()
  status?: StatusMail;

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
