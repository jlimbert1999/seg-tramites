import { IsEnum, IsMongoId } from 'class-validator';
import { groupProcedure } from 'src/procedures/interfaces';

export class GetTotalProceduresDto {
  @IsMongoId()
  id_institution: string;

  @IsEnum(groupProcedure, { message: 'procedure group is not valid' })
  group: groupProcedure;
}
