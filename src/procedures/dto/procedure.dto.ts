import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class ProcedureDto {
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
}
