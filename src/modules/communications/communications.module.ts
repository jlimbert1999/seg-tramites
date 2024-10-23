import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Communication,
  CommunicationSchema,
} from './schemas/communication.schema';
import { ProceduresModule } from '../procedures/procedures.module';
import { CommunicationController } from './controllers';
import { AdministrationModule } from '../administration/administration.module';
import { GroupwareModule } from '../groupware/groupware.module';
import { InboxService, OutboxService } from './services';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Communication.name, schema: CommunicationSchema },
    ]),
    AdministrationModule,
    GroupwareModule,
    ProceduresModule,
  ],
  controllers: [CommunicationController],
  providers: [InboxService, OutboxService],
  exports: [MongooseModule],
})
export class CommunicationsModule {}
