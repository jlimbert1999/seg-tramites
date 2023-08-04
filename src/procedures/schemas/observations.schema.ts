import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { ExternalProcedure } from './external.schema';
import { Account, Officer } from 'src/administration/schemas';
import { InternalProcedure } from './internal.schema';
export enum groupProcedure {
    tramites_externos = 'tramites_externos',
    tramites_internos = 'tramites_internos'
}

@Schema({ collection: 'observaciones' })
export class Observation extends Document {
    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'group',
    })
    procedure: ExternalProcedure | InternalProcedure

    @Prop({
        required: true,
        enum: Object.values(groupProcedure),
    })
    group: groupProcedure

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: Officer.name
    })
    officer: Officer

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: Account.name
    })
    account: Account;

    @Prop({
        type: String,
        required: true
    })
    description: string;

    @Prop({
        type: Boolean,
        default: false
    })
    solved: boolean

    @Prop({
        type: Date,
        default: Date.now
    })
    date: Date
}

export const ObservationSchema = SchemaFactory.createForClass(Observation);