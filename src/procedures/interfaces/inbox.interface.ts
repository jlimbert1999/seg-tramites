import { groupProcedure } from "../schemas"

export interface newImbox {
    emisor: participant
    receptor: participant
    tipo: groupProcedure


@Prop({
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: "tipo"
    })
tramite: InternalProcedure | ExternalProcedure


@Prop({
    type: String,
    required: true
})
motivo: string

@Prop({
    type: String,
    required: true
})
cantidad: string

@Prop({
    type: Date,
    required: true,
})
fecha_envio: Date

@Prop({
    type: Boolean
})
recibido: boolean
}

interface participant {
    cuenta: string
    fullname: string
    jobtitle?: string
}