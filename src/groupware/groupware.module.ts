import { Module } from '@nestjs/common';
import { GroupwareService } from './groupware.service';
import { GroupwareGateway } from './groupware.gateway';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  providers: [GroupwareGateway, GroupwareService],
  imports: [AuthModule],
  exports: [GroupwareGateway]
})
export class GroupwareModule { }
