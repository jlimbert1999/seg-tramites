import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Communication,
  CommunicationSchema,
} from './schemas/communication.schema';
import { ProceduresModule } from '../procedures/procedures.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Communication.name, schema: CommunicationSchema },
    ]),
    ProceduresModule,
  ],
  controllers: [],
  providers: [],
  exports: [MongooseModule],
})
export class CommunicationsModule {}
