import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PaginationParamsDto } from 'src/common/dto/pagination.dto';
import { groupProcedure } from 'src/procedures/interfaces';

export class SearchProcedureByCodeDto extends PaginationParamsDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsEnum(groupProcedure)
  @IsOptional()
  group?: string;
}
