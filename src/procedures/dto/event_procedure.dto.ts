import { IsEnum, IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import { stateProcedure } from '../interfaces';

export class EventProcedureDto {
  @IsMongoId()
  procedure: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum([stateProcedure.SUSPENDIDO, stateProcedure.CONCLUIDO])
  stateProcedure: stateProcedure;
}
