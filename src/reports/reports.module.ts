import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { AuthModule } from 'src/auth/auth.module';
import { ProceduresModule } from 'src/procedures/procedures.module';
import { AdministrationModule } from 'src/administration/administration.module';

@Module({
  controllers: [ReportsController],
  providers: [ReportsService],
  imports: [AuthModule, ProceduresModule, AdministrationModule],
})
export class ReportsModule {}
