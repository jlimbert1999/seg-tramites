import { IsNotEmpty, IsString } from 'class-validator';

export class ApplicantAuthenticacion {
  @IsString()
  @IsNotEmpty()
  dni: string;

  @IsString()
  @IsNotEmpty()
  code: string;
}
