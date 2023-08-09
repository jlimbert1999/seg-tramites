import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import { AdministrationModule } from 'src/administration/administration.module';

import { InternalController, ExternalController, InboxController, OutboxController } from './controllers/index'
import { ExternalService, InternalService, InboxService, OutboxService } from './services/index';
import { Observation, ObservationSchema } from './schemas/index';
import { Imbox, ImboxSchema } from './schemas/imbox.schema';
import { ExternalProcedure, ExternalProcedureSchema } from './schemas/external.schema';
import { InternalProcedure, InternalProcedureSchema } from './schemas/internal.schema';
import { Outbox, OutboxSchema } from './schemas/outbox.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ExternalProcedure.name, schema: ExternalProcedureSchema },
      { name: InternalProcedure.name, schema: InternalProcedureSchema },
      { name: Observation.name, schema: ObservationSchema },
      { name: Imbox.name, schema: ImboxSchema },
      { name: Outbox.name, schema: OutboxSchema },
    ]),
    AuthModule,
    AdministrationModule,
  ],
  controllers: [InternalController, ExternalController, InboxController, OutboxController],
  providers: [ExternalService, InternalService, InboxService, OutboxService]
})
export class ProceduresModule { }
