import { IsEnum, IsOptional } from 'class-validator';
import { PaginationParamsDto } from 'src/common/dto/pagination.dto';
import { statusMail } from 'src/procedures/interfaces';

export class GetInboxParamsDto extends PaginationParamsDto {
  @IsOptional()
  @IsEnum([statusMail.Pending, statusMail.Received], { message: 'state must be pending or received' })
  status: statusMail.Pending | statusMail.Received;
}
