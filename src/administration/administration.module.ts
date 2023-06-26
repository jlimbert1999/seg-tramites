import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';

import {
  AccountController,
  DependencyController,
  InstitutionController,
  OfficerController,
  RoleController,
  TypeProcedureController,
} from './controllers/index';

import {
  Account,
  AccountSchema,
  Dependency,
  DependencySchema,
  Institution,
  InstitutionSchema,
  Officer,
  OfficerSchema,
  Role,
  RoleSchema
} from './schemas/index';

import {
  AccountService,
  OfficerService,
  RoleService,
  DependencieService,
  InstitutionService
} from './services/index';
import { Job, JobSchema } from './schemas/job.schema';
import { JobService } from './services/job.service';
import { JobController } from './controllers/job.controller';
import { TypeProcedureService } from './services/type-procedure.service';
import { TypeProcedure, TypeProcedureSchema } from './schemas/type-procedure.schema';


@Module({
  controllers: [
    AccountController,
    DependencyController,
    InstitutionController,
    OfficerController,
    TypeProcedureController,
    RoleController,
    JobController
  ],
  providers: [AccountService, OfficerService, RoleService, DependencieService, InstitutionService, JobService, TypeProcedureService],
  imports: [
    MongooseModule.forFeature([
      { name: Job.name, schema: JobSchema },
      { name: Role.name, schema: RoleSchema },
      { name: Officer.name, schema: OfficerSchema },
      { name: Account.name, schema: AccountSchema },
      { name: Dependency.name, schema: DependencySchema },
      { name: Institution.name, schema: InstitutionSchema },
      { name: TypeProcedure.name, schema: TypeProcedureSchema },
    ]),
    AuthModule
  ],
  exports: [MongooseModule]
})
export class AdministrationModule { }
