import { Module } from '@nestjs/common';
import { InternalController } from './controllers/internal.controller';
import { ExternalController } from './controllers/external.controller';
import { ExternalService } from './services/external.service';
import { InternalService } from './services/internal.service';

@Module({
  controllers: [InternalController, ExternalController],
  providers: [ExternalService, InternalService]
})
export class ProceduresModule {}
