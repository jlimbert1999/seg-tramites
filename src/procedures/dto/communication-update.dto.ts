import { IsNotEmpty, IsString } from 'class-validator';

export class RejectionDetail {
  @IsString()
  @IsNotEmpty()
  rejectionReason: string;
}
