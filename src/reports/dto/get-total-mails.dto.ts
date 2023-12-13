import { IsEnum, IsIn } from 'class-validator';
import { groupProcedure } from 'src/procedures/interfaces';
type participantTypes = 'emitter' | 'receiver';

export class GetTotalMailsDto {
  @IsIn(['emitter', 'receiver'])
  participant: participantTypes;

  @IsEnum(groupProcedure)
  group: groupProcedure;
}
