import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import {
  InstitutionService,
  DependencieService,
} from 'src/administration/services';
import { GroupwareGateway } from 'src/groupware/groupware.gateway';
import { CommunicationService, InboxService, OutboxService } from '../services';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { validResources } from 'src/auth/interfaces/valid-resources.interface';

@Controller('communication')
@Auth(validResources.inbox)
export class CommunicationController {
  constructor(
    private readonly inboxService: InboxService,
    private readonly outboxService: OutboxService,
    private readonly institutionService: InstitutionService,
    private readonly dependencieService: DependencieService,
    private readonly groupwareGateway: GroupwareGateway,
    private readonly communicationServcice: CommunicationService,
  ) {}

  @Get('institutions')
  async getInstitutions() {
    return await this.institutionService.getActiveInstitutions();
  }

  @Get('dependencies/:id_institution')
  async getDependencies(@Param('id_institution') id_institution: string) {
    return await this.dependencieService.getActiveDependenciesOfInstitution(
      id_institution,
    );
  }
  @Get('accounts/:id_dependency')
  async getAcccount(
    @GetUser('_id') id_account: string,
    @Param('id_dependency') id_dependency: string,
  ) {
    return await this.inboxService.getAccountForSend(id_dependency, id_account);
  }

  @Get('inbox')
  async getInbox(
    @GetUser('_id') id_account: string,
    @Query('offset', ParseIntPipe) offset: number,
    @Query('limit', ParseIntPipe) limit: number,
  ) {
    return await this.communicationServcice.findInboxOfAccount(
      id_account,
      limit,
      offset,
    );
  }
  @Get('outbox')
  async getOutbox(
    @GetUser('_id') id_account: string,
    @Query('offset', ParseIntPipe) offset: number,
    @Query('limit', ParseIntPipe) limit: number,
  ) {
    return await this.communicationServcice.findOutboxOfAccount(
      id_account,
      limit,
      offset,
    );
  }

  @Get('search/:text')
  async search(
    @GetUser('_id')
    id_account: string,
    @Param('text') text: string,
    @Query('offset', ParseIntPipe) offset: number,
    @Query('limit', ParseIntPipe) limit: number,
  ) {
    return await this.inboxService.search(id_account, text, limit, offset);
  }
}
