import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';


class Institution {
    @Prop({
        type: String,
        required: true
    })
    name: string;

    @Prop({
        type: String,
        required: true
    })
    initials: string;
}


@Schema({ collection: 'dependencias' })
export class Dependency extends Document {
    @Prop({
        type: String,
        required: true
    })
    name: string;

    @Prop({
        type: String,
        required: true,
        unique: true,
        uppercase: true
    })
    initials: string;

    @Prop({
        type: String,
        required: true,
        unique: true
    })
    code: string

    @Prop({
        type: Boolean,
        default: true
    })
    active: boolean

    @Prop({
        type: Institution,
        default: true
    })
    institution: {
        name: string;
        initials: string
    }
}

export const DependencySchema = SchemaFactory.createForClass(Dependency);


