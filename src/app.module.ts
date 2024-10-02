import { ApplicantModule } from './applicant/applicant.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { AdministrationModule } from './administration/administration.module';
import { GroupwareModule } from './groupware/groupware.module';
import { ProceduresModule } from './procedures/procedures.module';
import { EnvConfiguration } from './config/env.configuration';
import { ReportsModule } from './reports/reports.module';
import { UsersModule } from './users/users.module';
import { FilesModule } from './modules/files/files.module';
import { PublicationsModule } from './modules/publications/publications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [EnvConfiguration],
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: process.env.MONGODB_URL,
      }),
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    AuthModule,
    UsersModule,
    AdministrationModule,
    ProceduresModule,
    GroupwareModule,
    ReportsModule,
    ApplicantModule,
    FilesModule,
    PublicationsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
