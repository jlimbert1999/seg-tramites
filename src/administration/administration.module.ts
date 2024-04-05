import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  JobController,
  OfficerController,
  DependencyController,
  InstitutionController,
  TypeProcedureController,
} from './controllers';

import {
  Job,
  JobSchema,
  Officer,
  OfficerSchema,
  Dependency,
  DependencySchema,
  Institution,
  InstitutionSchema,
  TypeProcedure,
  TypeProcedureSchema,
  JobChanges,
  JobChangesSchema,
} from './schemas/index';

import { DependencieService, InstitutionService, JobService, OfficerService, TypeProcedureService } from './services';

@Module({
  controllers: [DependencyController, InstitutionController, TypeProcedureController, OfficerController, JobController],
  providers: [DependencieService, InstitutionService, TypeProcedureService, OfficerService, JobService],
  imports: [
    MongooseModule.forFeature([
      { name: Job.name, schema: JobSchema },
      { name: Officer.name, schema: OfficerSchema },
      { name: JobChanges.name, schema: JobChangesSchema },
      { name: Dependency.name, schema: DependencySchema },
      { name: Institution.name, schema: InstitutionSchema },
      { name: TypeProcedure.name, schema: TypeProcedureSchema },
    ]),
  ],
  exports: [MongooseModule, TypeProcedureService, InstitutionService, DependencieService, OfficerService, JobService],
})
export class AdministrationModule {}
