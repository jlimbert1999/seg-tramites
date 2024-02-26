import { Module } from '@nestjs/common';
import { GroupwareService } from './groupware.service';
import { GroupwareGateway } from './groupware.gateway';
import { AuthModule } from 'src/auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from './schemas/post.schema';
import { PostController } from './controllers/post.controller';
import { PostService } from './services/post.service';

@Module({
  controllers: [PostController],
  providers: [GroupwareGateway, GroupwareService, PostService],
  imports: [AuthModule, MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }])],
  exports: [GroupwareGateway],
})
export class GroupwareModule {}
