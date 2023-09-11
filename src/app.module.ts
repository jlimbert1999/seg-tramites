import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { AdministrationModule } from './administration/administration.module';
import { GroupwareModule } from './groupware/groupware.module';
import { ProceduresModule } from './procedures/procedures.module';

@Module({
  imports: [
    // local mongodb://127.0.0.1:27017/new-seg-tramitesDB
    // atlas mongodb+srv://root:<password>@cluster0.jmkbaqz.mongodb.net/?retryWrites=true&w=majority
    // MongooseModule.forRoot(
    //   'mongodb+srv://root:8835024limbert@cluster0.jmkbaqz.mongodb.net/?retryWrites=true&w=majority',
    // ),
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: 'mongodb+srv://root:8835024limbert@cluster0.jmkbaqz.mongodb.net/seg-tramites?retryWrites=true&w=majority',
      }),
    }),
    AuthModule,
    AdministrationModule,
    GroupwareModule,
    ProceduresModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
