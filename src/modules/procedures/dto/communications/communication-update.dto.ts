import { ArrayMinSize, IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { StatusMail } from 'src/modules/procedures/interfaces';

export class UpdateCommunicationDto {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsEnum(StatusMail, { message: 'State procedure is not valid' })
  state: StatusMail;
}

export class CancelMailsDto {
  @IsMongoId({ each: true })
  @ArrayMinSize(1)
  ids_mails: string[];
}
