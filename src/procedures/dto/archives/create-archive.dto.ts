import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { stateProcedure } from 'src/procedures/interfaces';

export class CreateArchiveDto {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum([stateProcedure.SUSPENDIDO, stateProcedure.CONCLUIDO], { message: 'State procedure is not valid' })
  stateProcedure: stateProcedure.CONCLUIDO | stateProcedure.SUSPENDIDO;
}
