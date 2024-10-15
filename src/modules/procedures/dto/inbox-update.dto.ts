import { IsNotEmpty, IsString } from 'class-validator';

export class RejectionDetail {
  @IsString()
  @IsNotEmpty()
  rejection_reason: string;
}
