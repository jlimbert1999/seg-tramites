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


@Module({
  controllers: [
    AccountController,
    DependencyController,
    InstitutionController,
    OfficerController,
    TypeProcedureController,
    RoleController
  ],
  providers: [AccountService, OfficerService, RoleService, DependencieService, InstitutionService],
  imports: [
    MongooseModule.forFeature([
      { name: Role.name, schema: RoleSchema },
      { name: Officer.name, schema: OfficerSchema },
      { name: Account.name, schema: AccountSchema },
      { name: Dependency.name, schema: DependencySchema },
      { name: Institution.name, schema: InstitutionSchema },
    ]),
    AuthModule
  ],
  exports: [MongooseModule]
})
export class AdministrationModule { }
