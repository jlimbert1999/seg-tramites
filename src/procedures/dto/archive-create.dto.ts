import { IsNotEmpty, IsString } from 'class-validator';

export class CreateArchiveDto {
  @IsString()
  @IsNotEmpty()
  description: string;
}
