import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DependencyController, InstitutionController, TypeProcedureController } from './controllers/index';
import { Dependency, DependencySchema, Institution, InstitutionSchema } from './schemas/index';
import { DependencieService, InstitutionService } from './services/index';
import { TypeProcedureService } from './services/type-procedure.service';
import { TypeProcedure, TypeProcedureSchema } from './schemas/type-procedure.schema';

@Module({
  controllers: [DependencyController, InstitutionController, TypeProcedureController],
  providers: [DependencieService, InstitutionService, TypeProcedureService],
  imports: [
    MongooseModule.forFeature([
      { name: Dependency.name, schema: DependencySchema },
      { name: Institution.name, schema: InstitutionSchema },
      { name: TypeProcedure.name, schema: TypeProcedureSchema },
    ]),
  ],
  exports: [MongooseModule, TypeProcedureService, InstitutionService, DependencieService],
})
export class AdministrationModule {}
