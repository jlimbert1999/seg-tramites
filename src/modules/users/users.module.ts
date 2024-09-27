import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Role, RoleSchema, User, UserSchema } from './schemas';
import { RoleController, UserController } from './controllers';
import { RoleService, UserService } from './services';

import { AdministrationModule } from 'src/modules/administration/administration.module';
@Module({
  controllers: [RoleController, UserController],
  providers: [RoleService, UserService],
  imports: [
    // TODO delete after update
    AdministrationModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Role.name, schema: RoleSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class UsersModule {}
