import { IsNotEmpty, IsString } from 'class-validator';

export class SearchProcedureByCodeDto {
  @IsString()
  @IsNotEmpty()
  code: string;
}
