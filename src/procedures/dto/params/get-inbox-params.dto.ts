import { IsEnum, IsOptional } from 'class-validator';
import { PaginationParamsDto } from 'src/common/dto/pagination.dto';
import { StatusMail } from 'src/procedures/interfaces';

export class GetInboxParamsDto extends PaginationParamsDto {
  @IsOptional()
  @IsEnum([StatusMail.Pending, StatusMail.Received], { message: 'state must be pending or received' })
  status: StatusMail.Pending | StatusMail.Received;
}
