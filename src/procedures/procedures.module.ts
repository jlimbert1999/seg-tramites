import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AdministrationModule } from 'src/administration/administration.module';

import {
  InternalController,
  ExternalController,
  ArchiveController,
  ProcedureController,
  CommunicationController,
} from './controllers';
import { ExternalService, InternalService, CommunicationService, ObservationService, ArchiveService } from './services';
import {
  Communication,
  CommunicationSchema,
  ProcedureEvents,
  ProcedureEventSchema,
  ExternalDetail,
  ExternalDetailSchema,
  Procedure,
  ProcedureSchema,
  InternalDetail,
  InternalDetailSchema,
  Observation,
  ObservationSchema,
} from './schemas/index';
import { GroupwareModule } from 'src/groupware/groupware.module';
import { UsersModule } from 'src/users/users.module';

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
    ]),
    // AuthModule,
    UsersModule,
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
  providers: [ExternalService, InternalService, CommunicationService, ObservationService, ArchiveService],
  exports: [MongooseModule],
})
export class ProceduresModule {}
