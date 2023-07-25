import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InternalController } from './controllers/internal.controller';
import { ExternalController } from './controllers/external.controller';
import { ExternalService } from './services/external.service';
import { InternalService } from './services/internal.service';
import { ExternalProcedure, ExternalProcedureSchema } from './schemas/external.schema';
import { AuthModule } from 'src/auth/auth.module';
import { AdministrationModule } from 'src/administration/administration.module';
import { Observation, ObservationSchema } from './schemas/observations.schema';
import { ShippingModule } from 'src/shipping/shipping.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ExternalProcedure.name, schema: ExternalProcedureSchema },
      { name: Observation.name, schema: ObservationSchema }
    ]),
    AuthModule,
    AdministrationModule,
    ShippingModule
  ],
  controllers: [InternalController, ExternalController],
  providers: [ExternalService, InternalService]
})
export class ProceduresModule { }
