import { IsEnum, IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { StatusMail } from 'src/procedures/interfaces';

export class GetInboxParamsDto extends PaginationDto {
  @IsOptional()
  @IsEnum([StatusMail.Pending, StatusMail.Received], { message: 'state must be pending or received' })
  status: StatusMail.Pending | StatusMail.Received;
}
