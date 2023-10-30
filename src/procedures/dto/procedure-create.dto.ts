import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class CreateProcedureDto {
  @IsString()
  cite: string;

  @IsMongoId()
  type: string;

  @IsString()
  @IsNotEmpty()
  reference: string;

  @IsString()
  @IsNotEmpty()
  amount: string;

  @IsString()
  @IsNotEmpty()
  segment: string;
}
