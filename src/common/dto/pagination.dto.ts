import { Type } from 'class-transformer';
import { IsInt, IsPositive, Min } from 'class-validator';

export class PaginationParamsDto {
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  limit: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset: number;
}
