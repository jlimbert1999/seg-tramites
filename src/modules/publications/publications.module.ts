import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PublicationsService } from './publications.service';

import { Publication, PublicationSchema } from './schemas/publication.schema';
import { PostsController } from './publications.controller';
import { FilesModule } from '../files/files.module';
import { GroupwareModule } from 'src/groupware/groupware.module';

@Module({
  controllers: [PostsController],
  providers: [PublicationsService],
  imports: [
    FilesModule,
    GroupwareModule,
    MongooseModule.forFeature([
      { name: Publication.name, schema: PublicationSchema },
    ]),
  ],
})
export class PublicationsModule {}
