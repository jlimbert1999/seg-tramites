import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { AdministrationModule } from './administration/administration.module';
import { GroupwareModule } from './groupware/groupware.module';
import { ProceduresModule } from './procedures/procedures.module';
import { ConfigModule } from '@nestjs/config';
import { EnvConfiguration } from './config/configuration';
import { ReportsModule } from './reports/reports.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    // local mongodb://127.0.0.1:27017/new-seg-tramitesDB
    // atlas mongodb+srv://root:<password>@cluster0.jmkbaqz.mongodb.net/?retryWrites=true&w=majority
    // MongooseModule.forRoot(
    //   'mongodb+srv://root:8835024limbert@cluster0.jmkbaqz.mongodb.net/?retryWrites=true&w=majority',
    // ),
    ConfigModule.forRoot({
      load: [EnvConfiguration],
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
    AdministrationModule,
    GroupwareModule,
    ProceduresModule,
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
