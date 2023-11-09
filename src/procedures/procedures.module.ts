import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from 'src/auth/auth.module';
import { AdministrationModule } from 'src/administration/administration.module';

import {
  InternalController,
  ExternalController,
  ArchiveController,
  ProcedureController,
  CommunicationController,
} from './controllers';
import {
  ExternalService,
  InternalService,
  CommunicationService,
  ObservationService,
  ArchiveService,
  ProcedureService,
} from './services';
import {
  Communication,
  CommunicationSchema,
  ProcedureEvents,
  ProcedureEventSchema,
  Observaciones,
  ObservacionSchema,
  ExternalProcedure,
  ExternalProcedureSchema,
  InternalProcedure,
  InternalProcedureSchema,
  Inbox,
  InboxSchema,
  Outbox,
  OutboxSchema,
  ExternalDetail,
  ExternalDetailSchema,
  ArchivoSchema,
  Archivos,
  Procedure,
  ProcedureSchema,
  InternalDetail,
  InternalDetailSchema,
  Observation,
  ObservationSchema,
} from './schemas/index';
import { GroupwareModule } from 'src/groupware/groupware.module';
import { Eventos, EventosSchema } from './schemas/eventos.schema';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: Procedure.name, schema: ProcedureSchema },
      { name: InternalDetail.name, schema: InternalDetailSchema },
      { name: ExternalDetail.name, schema: ExternalDetailSchema },
      { name: ProcedureEvents.name, schema: ProcedureEventSchema },
      { name: Communication.name, schema: CommunicationSchema },
      { name: Observation.name, schema: ObservationSchema },

      { name: ExternalProcedure.name, schema: ExternalProcedureSchema },
      { name: InternalProcedure.name, schema: InternalProcedureSchema },
      { name: Observaciones.name, schema: ObservacionSchema },
      { name: Inbox.name, schema: InboxSchema },
      { name: Outbox.name, schema: OutboxSchema },
      { name: Archivos.name, schema: ArchivoSchema },
      { name: Eventos.name, schema: EventosSchema },
    ]),
    AuthModule,
    AdministrationModule,
    GroupwareModule,
  ],
  controllers: [
    InternalController,
    ExternalController,
    ProcedureController,
    CommunicationController,
    ArchiveController,
  ],
  providers: [
    ExternalService,
    InternalService,
    ProcedureService,
    CommunicationService,
    ObservationService,
    ArchiveService,
  ],
  exports: [MongooseModule],
})
export class ProceduresModule {}
