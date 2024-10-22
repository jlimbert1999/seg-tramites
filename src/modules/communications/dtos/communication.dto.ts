import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class ReceiverDto {
  @IsMongoId()
  cuenta: string;

  @IsString()
  @IsNotEmpty()
  fullname: string;

  @IsString()
  @IsOptional()
  jobtitle?: string;

  @IsBoolean()
  isOriginal: boolean;
}

export class CreateCommunicationDto {
  @IsMongoId()
  @IsOptional()
  mailId?: string;

  @IsMongoId()
  procecureId: string;

  @IsString()
  @IsNotEmpty()
  attachmentsCount: string;

  @IsString()
  @IsNotEmpty()
  reference: string;

  @IsString()
  @IsOptional()
  internalNumber: string;

  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => ReceiverDto)
  receivers: ReceiverDto[];
}
