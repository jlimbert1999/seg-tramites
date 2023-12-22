import { ConfigController } from './administration/controllers/config.controller';
import { ServeStaticModule } from '@nestjs/serve-static';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AdministrationModule } from './administration/administration.module';
import { GroupwareModule } from './groupware/groupware.module';
import { ProceduresModule } from './procedures/procedures.module';
import { EnvConfiguration } from './config/env.configuration';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [EnvConfiguration],
    }),
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: process.env.MONGODB_URL,
      }),
    }),
    AuthModule,
    AdministrationModule,
    GroupwareModule,
    ProceduresModule,
    ReportsModule,
  ],
  controllers: [ConfigController, AppController],
  providers: [AppService],
})
export class AppModule {}
