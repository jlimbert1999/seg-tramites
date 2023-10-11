import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { groupArchive } from '../interfaces';

export class CreateArchiveDto {
  @IsMongoId()
  procedure: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(groupArchive)
  @IsOptional()
  group: groupArchive;
}
