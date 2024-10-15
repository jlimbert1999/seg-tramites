import { PartialType } from '@nestjs/mapped-types';
import { CreateInternalDetailDto } from './internal-create.dto';

export class UpdateInternalDetailDto extends PartialType(CreateInternalDetailDto) {}
