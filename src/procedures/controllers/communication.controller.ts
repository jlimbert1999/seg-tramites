import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { InstitutionService, DependencieService } from 'src/modules/administration/services';
import { GroupwareGateway } from 'src/groupware/groupware.gateway';
import { InboxService, OutboxService } from '../services';
import { GetUserRequest, ResourceProtected } from 'src/auth/decorators';
import { CancelMailsDto, CreateCommunicationDto, GetInboxParamsDto, UpdateCommunicationDto } from '../dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

import { SystemResource } from 'src/auth/constants';
import { IsMongoidPipe } from 'src/common/pipes';
import { AccountService } from 'src/modules/administration/services/account.service';
import { Account } from 'src/modules/administration/schemas';


@Controller('communication')
@ResourceProtected(SystemResource.communication)
export class CommunicationController {
  constructor(
    private readonly accountService: AccountService,
    private readonly institutionService: InstitutionService,
    private readonly dependencieService: DependencieService,
    private readonly groupwareGateway: GroupwareGateway,
    private readonly inboxService: InboxService,
    private readonly outboxService: OutboxService,
  ) {}

  @Get('institutions')
  getInstitutions() {
    return this.institutionService.getActiveInstitutions();
  }

  @Get('dependencies/:id_institution')
  async getDependencies(@Param('id_institution', IsMongoidPipe) id_institution: string) {
    return await this.dependencieService.getActiveDependenciesOfInstitution(id_institution);
  }

  @Get('accounts/:id_dependency')
  async getAccountsForSend(
    @GetUserRequest('_id') id_account: string,
    @Param('id_dependency', IsMongoidPipe) id_dependency: string,
  ) {
    return await this.accountService.getAccountsForSend(id_dependency, id_account);
  }

  @Post()
  async create(@GetUserRequest() account: Account, @Body() communication: CreateCommunicationDto) {
    const mails = await this.inboxService.create(communication, account);
    this.groupwareGateway.sendMails(mails);
    return { message: 'Tramite enviado' };
  }

  @Get('inbox')
  getInbox(@GetUserRequest('_id') id_account: string, @Query() params: GetInboxParamsDto) {
    return this.inboxService.findAll(id_account, params);
  }

  @Get('outbox')
  getOutbox(@GetUserRequest('_id') id_account: string, @Query() paginationParams: PaginationDto) {
    return this.outboxService.findAll(id_account, paginationParams);
  }

  @Put('accept/:id_mail')
  acceptMail(@Param('id_mail', IsMongoidPipe) id_mail: string) {
    return this.inboxService.accept(id_mail);
  }

  @Put('reject/:id')
  reject(
    @Param('id', IsMongoidPipe) id: string,
    @Body() data: UpdateCommunicationDto,
    @GetUserRequest() account: Account,
  ) {
    return this.inboxService.reject(id, account, data);
  }

  @Delete('outbox/:id_procedure')
  async cancelMails(
    @GetUserRequest('_id') id_account: string,
    @Param('id_procedure') id_procedure: string,
    @Body() body: CancelMailsDto,
  ) {
    const { message, mails } = await this.inboxService.cancelMails(body.ids_mails, id_procedure, id_account);
    this.groupwareGateway.cancelMails(mails);
    return { message };
  }

  @Get('/:id')
  getMailDetails(@Param('id', IsMongoidPipe) id_mail: string, @GetUserRequest() account: Account) {
    return this.inboxService.getMailDetails(id_mail, account);
  }

  @Get('inbox/search/:text')
  searchInbox(
    @GetUserRequest('_id') id_account: string,
    @Param('text') text: string,
    @Query() params: GetInboxParamsDto,
  ) {
    return this.inboxService.search(id_account, text, params);
  }

  @Get('outbox/search/:text')
  searchOutbox(
    @GetUserRequest('_id') id_account: string,
    @Param('text') text: string,
    @Query() PaginationDto: PaginationDto,
  ) {
    return this.outboxService.search(id_account, text, PaginationDto);
  }
}
