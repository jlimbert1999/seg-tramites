import { IsMongoId, IsOptional } from 'class-validator';
import { PaginationParamsDto } from 'src/common/dto/pagination.dto';

export class GetAccountsDto extends PaginationParamsDto {
  @IsOptional()
  @IsMongoId()
  id_dependency?: string;
}
