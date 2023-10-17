import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class EventProcedureDto {
  @IsMongoId()
  procedure: string;

  @IsString()
  @IsNotEmpty()
  description: string;
}
