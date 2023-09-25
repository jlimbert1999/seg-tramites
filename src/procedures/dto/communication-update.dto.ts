import { ArrayMinSize, IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class RejectionDetail {
  @IsString()
  @IsNotEmpty()
  rejectionReason: string;
}
export class CancelMailsDto {
  @IsMongoId({ each: true })
  @ArrayMinSize(1)
  ids_mails: string[];
}
