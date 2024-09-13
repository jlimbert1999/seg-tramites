import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';
import { PostPriority } from '../schemas/post.schema';
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

  @IsEnum(PostPriority)
  priority: PostPriority;
}

export class UpdatePublicationDto extends PartialType(CreatePublicationDto) {}
