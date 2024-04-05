import { IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateJobDto {
  @IsNotEmpty()
  @IsString()
  nombre: string;

  @IsBoolean()
  @IsOptional()
  isRoot: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  dependents: string[];
}
