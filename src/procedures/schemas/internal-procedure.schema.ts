import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { TypeProcedure } from 'src/administration/schemas';
import { stateProcedure } from '../interfaces';
import { Account } from 'src/modules/users/schemas';

@Schema({ _id: false })
class Person {
  @Prop({
    type: String,
    required: true,
    uppercase: true,
  })
  nombre: string;

  @Prop({
    type: String,
    required: true,
    uppercase: true,
  })
  cargo: string;
}
const PersonSchema = SchemaFactory.createForClass(Person);

@Schema()
export class InternalProcedure {
  code: string;
  cite: string;
  type: TypeProcedure;
  account: Account;
  state: stateProcedure;
  reference: string;
  amount: string;
  group: string;

  @Prop({
    type: PersonSchema,
    required: true,
  })
  remitente: Person;

  @Prop({
    type: PersonSchema,
    required: true,
  })
  destinatario: Person;
}

export const InternalProcedureSchema =
  SchemaFactory.createForClass(InternalProcedure);
