import { IsOptional, IsString } from 'class-validator';
import { PaginationParamsDto } from 'src/common';

export class FilterRoleDto extends PaginationParamsDto {
  @IsOptional()
  @IsString()
  term: string;
}
