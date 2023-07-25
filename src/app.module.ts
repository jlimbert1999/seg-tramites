import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { AdministrationModule } from './administration/administration.module';
import { GroupwareModule } from './groupware/groupware.module';
import { ProceduresModule } from './procedures/procedures.module';
import { ShippingModule } from './shipping/shipping.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://127.0.0.1:27017/test-seg-tramites'),
    AuthModule,
    AdministrationModule,
    GroupwareModule,
    ProceduresModule,
    ShippingModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
