import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdministrationModule } from 'src/administration/administration.module';
import { Account, AccountSchema, Role, RoleSchema } from './schemas';
import { AccountController, RoleController } from './controllers';
import { AccountService, RoleService } from './services';

@Module({
  controllers: [AccountController, RoleController],
  providers: [AccountService, RoleService],
  imports: [
    AdministrationModule,
    MongooseModule.forFeature([
      { name: Role.name, schema: RoleSchema },
      { name: Account.name, schema: AccountSchema },
    ]),
  ],
  exports: [MongooseModule, AccountService],
})
export class UsersModule {}
