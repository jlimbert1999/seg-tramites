import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { ProceduresModule } from 'src/procedures/procedures.module';
import { AdministrationModule } from 'src/administration/administration.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  controllers: [ReportsController],
  providers: [ReportsService],
  imports: [ProceduresModule, UsersModule, AdministrationModule],
})
export class ReportsModule {}
