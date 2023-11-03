import { IsEnum, IsMongoId } from 'class-validator';
import { groupProcedure } from '../interfaces';

export class GetProcedureParamsDto {
  @IsMongoId()
  id_procedure: string;

  @IsEnum(groupProcedure)
  group: groupProcedure;
}
