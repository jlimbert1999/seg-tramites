import { IsString, IsMongoId, IsNotEmpty } from 'class-validator';

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
  numberOfDocuments: string;

  @IsString()
  @IsNotEmpty()
  segment: string;
}
