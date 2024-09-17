import { Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional } from 'class-validator';
import { PaginationParamsDto } from 'src/common/dto/pagination.dto';

export class FilterPublications extends PaginationParamsDto {
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  priority?: number;

  @IsBoolean()
  @IsOptional()
  news?: boolean;
}
