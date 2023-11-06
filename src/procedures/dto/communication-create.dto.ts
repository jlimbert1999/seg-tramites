import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsMongoId, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';

export class ReceiverDto {
  @IsMongoId()
  cuenta: string;

  @IsString()
  @IsNotEmpty()
  fullname: string;

  @IsString()
  @IsOptional()
  jobtitle?: string;
}

export class CreateCommunicationDto {
  @IsMongoId()
  @IsOptional()
  id_mail?: string;

  @IsMongoId()
  id_procedure: string;

  @IsString()
  @IsNotEmpty()
  attachmentQuantity: string;

  @IsString()
  @IsNotEmpty()
  reference: string;

  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => ReceiverDto)
  receivers: ReceiverDto[];

  @IsString()
  @IsOptional()
  internalNumber: string;
}
