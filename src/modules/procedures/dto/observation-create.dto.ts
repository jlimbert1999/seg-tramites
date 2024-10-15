import { IsNotEmpty, IsString } from 'class-validator';

export class CreateObservationDto {
  @IsString()
  @IsNotEmpty()
  description: string;
}
