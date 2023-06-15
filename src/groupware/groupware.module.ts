import { Module } from '@nestjs/common';
import { GroupwareService } from './groupware.service';
import { GroupwareGateway } from './groupware.gateway';

@Module({
  providers: [GroupwareGateway, GroupwareService]
})
export class GroupwareModule {}
