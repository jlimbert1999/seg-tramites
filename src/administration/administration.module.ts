import { Module } from '@nestjs/common';
import { AccountController } from './controllers/account.controller';
import { DependencieController } from './controllers/dependencie.controller';
import { OfficerController } from './controllers/officer.controller';
import { TypeProcedureController } from './controllers/type-procedure.controller';
import { AccountService } from './services/account.service';
import { OfficerService } from './services/officer.service';
import { RoleController } from './controllers/role.controller';
import { RoleService } from './services/role.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Role, RoleSchema } from './schemas/role.schema';
import { Officer, OfficerSchema } from './schemas/officer.schema';
import { DependencieService } from './services/dependencie.service';
import { Account, AccountSchema } from './schemas/account.schema';
import { Dependency, DependencySchema } from './schemas/dependencie.schema';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [AccountController, DependencieController, OfficerController, TypeProcedureController, RoleController],
  providers: [AccountService, OfficerService, RoleService, DependencieService],
  imports: [
    MongooseModule.forFeature([
      { name: Role.name, schema: RoleSchema },
      { name: Officer.name, schema: OfficerSchema },
      { name: Account.name, schema: AccountSchema },
      { name: Dependency.name, schema: DependencySchema },
    ]),
    AuthModule
  ],
  exports: [MongooseModule]
})
export class AdministrationModule { }
