import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class ReceiverDto {
  @IsMongoId()
  cuenta: string;

  @IsString()
  @IsNotEmpty()
  fullname: string;

  @IsString()
  @IsOptional()
  jobtitle?: string;
}

export class CreateInboxDto {
  @IsMongoId()
  tramite: string;

  @IsString()
  @IsNotEmpty()
  cantidad: string;

  @IsString()
  @IsNotEmpty()
  motivo: string;

  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => ReceiverDto)
  receivers: ReceiverDto[];

  @IsString()
  @IsOptional()
  numero_interno: string;
}
