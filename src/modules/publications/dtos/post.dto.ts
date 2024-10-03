import { IsArray, IsDate, IsEnum, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { PublicationPriority } from '../schemas/publication.schema';
import { IsStartDateBeforeExpiration } from '../decorators/is-before.decorator';

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

  @IsString()
  @IsOptional()
  image: string;

  @Type(() => Date)
  @IsDate()
  @IsStartDateBeforeExpiration({ message: 'Start date must be earlier than expiration date' }) // Aplicamos la validación aquí
  startDate: Date;
}

export class UpdatePublicationDto extends PartialType(CreatePublicationDto) {}
