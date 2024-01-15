import { IsArray, IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class CreateJobDto {
  @IsNotEmpty()
  @IsString()
  nombre: string;

  @IsBoolean()
  isRoot: boolean;

  @IsArray()
  @IsString({ each: true })
  dependents: string[];
}
