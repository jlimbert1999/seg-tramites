import { Module } from '@nestjs/common';
import { ApplicantService } from './applicant.service';
import { ApplicantController } from './applicant.controller';
import { ProceduresModule } from 'src/modules/procedures/procedures.module';

@Module({
  imports: [ProceduresModule],
  controllers: [ApplicantController],
  providers: [ApplicantService],
})
export class ApplicantModule {}
