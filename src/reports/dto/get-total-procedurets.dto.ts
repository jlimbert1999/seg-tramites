import { IsEnum } from 'class-validator';
import { groupProcedure } from 'src/procedures/interfaces';

export class GetTotalProceduresDto {
  @IsEnum(groupProcedure, { message: 'procedure group is not valid' })
  group: groupProcedure;
}
