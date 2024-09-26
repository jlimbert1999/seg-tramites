import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { TypeProcedure } from 'src/administration/schemas';
import { stateProcedure } from '../interfaces';
import { Account } from 'src/modules/users/schemas';

@Schema({ _id: false })
class Applicant {
  @Prop({
    type: String,
    required: true,
    uppercase: true,
  })
  nombre: string;

  @Prop({
    type: String,
    uppercase: true,
  })
  paterno: string;

  @Prop({
    type: String,
    uppercase: true,
  })
  materno: string;

  @Prop({
    type: String,
    uppercase: true,
  })
  telefono: string;

  @Prop({
    type: String,
    uppercase: true,
  })
  dni: string;

  @Prop({
    type: String,
    enum: ['JURIDICO', 'NATURAL'],
    required: true,
  })
  tipo: string;

  @Prop({
    type: String,
  })
  documento: string;
}

@Schema({ _id: false })
class Representative {
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
  paterno: string;

  @Prop({
    type: String,
    uppercase: true,
  })
  materno: string;

  @Prop({
    type: String,
    uppercase: true,
  })
  telefono: string;

  @Prop({
    type: String,
    uppercase: true,
    required: true,
  })
  dni: string;

  @Prop({
    type: String,
  })
  documento: string;
}
const ApplicantSchema = SchemaFactory.createForClass(Applicant);
const RepresentativeSchema = SchemaFactory.createForClass(Representative);

@Schema()
export class ExternalProcedure {
  code: string;
  cite: string;
  type: TypeProcedure;
  account: Account;
  state: stateProcedure;
  reference: string;
  amount: string;
  group: string;

  @Prop({
    type: RepresentativeSchema,
  })
  representante: Representative;

  @Prop({
    type: ApplicantSchema,
  })
  solicitante: Applicant;

  @Prop({ type: [String], default: [] })
  requirements: string[];

  @Prop({
    type: Number,
    required: true,
  })
  pin: number;
}
export const ExternalProcedureSchema =
  SchemaFactory.createForClass(ExternalProcedure);
