import { PickType } from '@nestjs/mapped-types';
import { CreateArchiveDto } from './archive-create.dto';

export class UpdateArchiveDto extends PickType(CreateArchiveDto, [
  'description',
] as const) {}
