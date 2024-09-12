import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { PostPriority } from '../schemas/post.schema';
import { PartialType } from '@nestjs/mapped-types';

export class CreatePublicationDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  files: string[];

  @IsEnum(PostPriority)
  priority: PostPriority;
}

export class UpdatePublicationDto extends PartialType(CreatePublicationDto) {}
