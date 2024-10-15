import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { stateProcedure } from 'src/modules/procedures/interfaces';

export class CreateArchiveDto {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum([stateProcedure.SUSPENDIDO, stateProcedure.CONCLUIDO], { message: 'State procedure is not valid' })
  state: stateProcedure.CONCLUIDO | stateProcedure.SUSPENDIDO;
}
