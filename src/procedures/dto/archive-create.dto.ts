import { IsEnum, IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import { stateProcedure } from '../interfaces';

export class CreateArchiveDto {
  @IsMongoId()
  procedure: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum([stateProcedure.CONCLUIDO, stateProcedure.SUSPENDIDO], {
    message: 'El campo state solo puede ser CONCLUIDO o SUSPENDIDO',
  })
  state: stateProcedure;
}
