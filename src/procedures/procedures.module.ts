import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import { AdministrationModule } from 'src/administration/administration.module';
import { InternalController, ExternalController, ImboxController, OutboxController } from './controllers/index'
import { ExternalService, InternalService, ImboxService, OutboxService } from './services/index';
import { ExternalProcedure, ExternalProcedureSchema, Observation, ObservationSchema, Imbox, ImboxSchema, Outbox, OutboxSchema } from './schemas/index';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ExternalProcedure.name, schema: ExternalProcedureSchema },
      { name: Observation.name, schema: ObservationSchema },
      { name: Imbox.name, schema: ImboxSchema },
      { name: Outbox.name, schema: OutboxSchema },
    ]),
    AuthModule,
    AdministrationModule,
  ],
  controllers: [InternalController, ExternalController, ImboxController, OutboxController],
  providers: [ExternalService, InternalService, ImboxService, OutboxService]
})
export class ProceduresModule { }
