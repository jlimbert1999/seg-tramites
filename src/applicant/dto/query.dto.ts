import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ApplicantQueryDto {
  @IsString()
  @IsNotEmpty()
  dni: string;

  @IsNumber()
  pin: number;
}
