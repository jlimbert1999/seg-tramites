import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  Account,
  AccountSchema,
  Job,
  JobChanges,
  JobChangesSchema,
  JobSchema,
  Officer,
  OfficerSchema,
  Role,
  RoleSchema,
} from '../users/schemas';
import { AccountService, OfficerService, JobService, RoleService } from '../users/services';
import { AdministrationModule } from 'src/administration/administration.module';
import { AccountController, JobController, OfficerController, RoleController } from './controllers';

@Module({
  controllers: [AccountController, OfficerController, JobController, RoleController],
  providers: [AccountService, OfficerService, JobService, RoleService],
  imports: [
    AdministrationModule,
    MongooseModule.forFeature([
      { name: Account.name, schema: AccountSchema },
      { name: Officer.name, schema: OfficerSchema },
      { name: Job.name, schema: JobSchema },
      { name: Role.name, schema: RoleSchema },
      { name: JobChanges.name, schema: JobChangesSchema },
    ]),
  ],
  exports: [MongooseModule, AccountService, OfficerService],
})
export class UsersModule {}
