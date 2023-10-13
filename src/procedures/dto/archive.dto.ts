import { IsEnum, IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import { stateProcedure } from '../interfaces';

export class ArchiveDto {
  @IsMongoId()
  procedure: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(stateProcedure)
  state: stateProcedure;
}
