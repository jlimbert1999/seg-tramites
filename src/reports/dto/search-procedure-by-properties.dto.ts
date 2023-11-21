import { IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { groupProcedure, stateProcedure } from 'src/procedures/interfaces';

export class searchProcedureByPropertiesDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  code?: string;

  @IsEnum(Object.values(stateProcedure))
  @IsOptional()
  state?: stateProcedure;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  reference?: string;

  @IsMongoId()
  @IsOptional()
  type?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  start?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  end?: string;

  @IsEnum(Object.values(groupProcedure))
  @IsOptional()
  group?: groupProcedure;
}
