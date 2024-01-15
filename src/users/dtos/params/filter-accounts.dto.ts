import { IsMongoId, IsNotEmpty, IsOptional } from 'class-validator';
import { PaginationParamsDto } from 'src/common/dto/pagination.dto';

export class FilterAccountsDto extends PaginationParamsDto {
  @IsOptional()
  @IsNotEmpty()
  text: string;

  @IsOptional()
  @IsMongoId()
  id_dependency?: string;
}
