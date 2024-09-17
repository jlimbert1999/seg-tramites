import {
  IsArray,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';
import { PublicationPriority } from '../schemas/post.schema';
import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';

export class AttachmentDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  filename: string;
}

export class CreatePublicationDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttachmentDto)
  attachments: AttachmentDto[];

  @IsEnum(PublicationPriority)
  priority: PublicationPriority;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  expirationDate: Date;
}

export class UpdatePublicationDto extends PartialType(CreatePublicationDto) {}
