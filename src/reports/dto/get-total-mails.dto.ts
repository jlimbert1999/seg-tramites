import { IsIn, IsMongoId } from 'class-validator';
import { group } from 'console';
type group = 'emitter' | 'receiver';

export class GetTotalMailsDto {
  @IsMongoId()
  id_institution: string;

  @IsIn(['emitter', 'receiver'])
  group: group;
}
