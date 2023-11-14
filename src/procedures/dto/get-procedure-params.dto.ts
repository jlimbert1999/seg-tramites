import { IsEnum, IsMongoId } from 'class-validator';
import { groupProcedure } from '../interfaces';

export class GetProcedureParamsDto {
  @IsMongoId({ message: 'Identificador del tramite invalido' })
  id_procedure: string;

  @IsEnum(groupProcedure, { message: 'Grupo de tramite no valido' })
  group: groupProcedure;
}
