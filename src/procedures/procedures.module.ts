import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AdministrationModule } from 'src/modules/administration/administration.module';

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
  InboxService,
  ObservationService,
  ArchiveService,
  OutboxService,
} from './services';
import {
  ExternalDetail,
  ExternalDetailSchema,
  Procedure,
  ProcedureSchema,
  InternalDetail,
  InternalDetailSchema,
  Observation,
  ObservationSchema,
  Communication,
  CommunicationSchema,
  ProcedureBase,
  ProcedureBaseSchema,
  InternalProcedure,
  InternalProcedureSchema,
  ExternalProcedure,
  ExternalProcedureSchema,
} from './schemas/index';
import { GroupwareModule } from 'src/groupware/groupware.module';
import { UsersModule } from 'src/modules/users/users.module';


@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: Procedure.name, schema: ProcedureSchema },
      { name: InternalDetail.name, schema: InternalDetailSchema },
      { name: ExternalDetail.name, schema: ExternalDetailSchema },
      { name: Communication.name, schema: CommunicationSchema },
      { name: Observation.name, schema: ObservationSchema },
      {
        name: ProcedureBase.name,
        schema: ProcedureBaseSchema,
        discriminators: [
          { name: InternalProcedure.name, schema: InternalProcedureSchema },
          { name: ExternalProcedure.name, schema: ExternalProcedureSchema },
        ],
      },
    ]),
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
  providers: [
    ExternalService,
    InternalService,
    InboxService,
    ObservationService,
    ArchiveService,
    OutboxService,
  ],
  exports: [MongooseModule],
})
export class ProceduresModule {}
