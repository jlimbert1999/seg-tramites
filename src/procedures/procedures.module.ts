import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import { AdministrationModule } from 'src/administration/administration.module';

import {
  InternalController,
  ExternalController,
} from './controllers/index';
import {
  ExternalService,
  InternalService,
  InboxService,
  OutboxService,
  CommunicationService,
} from './services/index';
import {
  Communication,
  CommunicationSchema,
  Observation,
  ObservationSchema,
} from './schemas/index';
import { Inbox, InboxSchema } from './schemas/inbox.schema';
import {
  ExternalProcedure,
  ExternalProcedureSchema,
} from './schemas/external.schema';
import {
  InternalProcedure,
  InternalProcedureSchema,
} from './schemas/internal.schema';
import { Outbox, OutboxSchema } from './schemas/outbox.schema';
import { GroupwareModule } from 'src/groupware/groupware.module';
import { ProcedureController } from './controllers/procedure.controller';
import { ProcedureService } from './services/procedure.service';
import { Procedure, ProcedureSchema } from './schemas/procedure.schema';
import {
  ExternalDetail,
  ExternalDetailSchema,
} from './schemas/external-detail.schema';
import {
  InternalDetail,
  InternalDetailSchema,
} from './schemas/internal-detail.schema';
import { CommunicationController } from './controllers/communication.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ExternalProcedure.name, schema: ExternalProcedureSchema },
      { name: InternalProcedure.name, schema: InternalProcedureSchema },
      { name: Observation.name, schema: ObservationSchema },
      { name: Inbox.name, schema: InboxSchema },
      { name: Outbox.name, schema: OutboxSchema },
      { name: Procedure.name, schema: ProcedureSchema },
      { name: ExternalDetail.name, schema: ExternalDetailSchema },
      { name: InternalDetail.name, schema: InternalDetailSchema },
      { name: Communication.name, schema: CommunicationSchema },
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
  ],
  providers: [
    ExternalService,
    InternalService,
    InboxService,
    OutboxService,
    ProcedureService,
    CommunicationService,
  ],
})
export class ProceduresModule {}
