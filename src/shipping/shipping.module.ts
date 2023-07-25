import { Module } from '@nestjs/common';
import { InController } from './controllers/in.controller';
import { OutController } from './controllers/out.controller';
import { InService } from './services/in.service';
import { OutService } from './services/out.service';
import { MongooseModule } from '@nestjs/mongoose';
import { In, InSchema } from './schemas/in.schema';
import { Out, OutSchema } from './schemas/out.schema';
import { ProceduresModule } from 'src/procedures/procedures.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: In.name, schema: InSchema },
      { name: Out.name, schema: OutSchema },
    ]),
    ProceduresModule
  ],
  controllers: [InController, OutController],
  providers: [InService, OutService],
  exports: [OutService]
})
export class ShippingModule { }
