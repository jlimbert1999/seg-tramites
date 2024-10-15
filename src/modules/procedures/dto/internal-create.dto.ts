import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNotEmptyObject,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';

export class Worker {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  cargo: string;
}

export class CreateInternalDetailDto {
  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => Worker)
  remitente: Worker;

  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => Worker)
  destinatario: Worker;
}
