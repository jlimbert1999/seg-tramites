import { PartialType } from '@nestjs/mapped-types';
import { CreateGroupwareDto } from './create-groupware.dto';

export class UpdateGroupwareDto extends PartialType(CreateGroupwareDto) {
  id: number;
}
