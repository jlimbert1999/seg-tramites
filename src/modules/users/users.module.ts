import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdministrationModule } from 'src/administration/administration.module';
import {
  Account,
  AccountSchema,
  Role,
  RoleSchema,
  User,
  UserSchema,
} from './schemas';
import { AccountController, RoleController } from './controllers';
import { AccountService, RoleService } from './services';
import { UserService } from './services/user.service';
import { UserController } from './controllers/user.controller';

@Module({
  controllers: [AccountController, RoleController, UserController],
  providers: [AccountService, RoleService, UserService],
  imports: [
    AdministrationModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Role.name, schema: RoleSchema },
      { name: Account.name, schema: AccountSchema },
    ]),
  ],
  exports: [MongooseModule, AccountService],
})
export class UsersModule {}
