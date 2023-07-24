import { Module } from '@nestjs/common';
import { InternalController } from './controllers/internal.controller';
import { ExternalController } from './controllers/external.controller';
import { ExternalService } from './services/external.service';
import { InternalService } from './services/internal.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ExternalProcedure, ExternalProcedureSchema } from './schemas/external.schema';
import { AuthModule } from 'src/auth/auth.module';
import { AdministrationModule } from 'src/administration/administration.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ExternalProcedure.name, schema: ExternalProcedureSchema }]),
    AuthModule,
    AdministrationModule
  ],
  controllers: [InternalController, ExternalController],
  providers: [ExternalService, InternalService]
})
export class ProceduresModule { }
