import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { InstitutionService, DependencieService } from 'src/administration/services';
import { GroupwareGateway } from 'src/groupware/groupware.gateway';
import { CommunicationService } from '../services';
import { GetUserRequest, ResourceProtected } from 'src/auth/decorators';
import { CancelMailsDto, CreateCommunicationDto, GetInboxParamsDto, RejectionDetail } from '../dto';
import { PaginationParamsDto } from 'src/common/dto/pagination.dto';
import { AccountService } from 'src/users/services/account.service';
import type { Account } from 'src/users/schemas';
import { VALID_RESOURCES } from 'src/auth/constants';
import { IsMongoidPipe } from 'src/common/pipes';

@Controller('communication')
// @ResourceProtected(VALID_RESOURCES.communication)
export class CommunicationController {
  constructor(
    private readonly accountService: AccountService,
    private readonly institutionService: InstitutionService,
    private readonly dependencieService: DependencieService,
    private readonly communicationService: CommunicationService,
    private readonly groupwareGateway: GroupwareGateway,
  ) {}

  @Get('generate')
  generate() {
    return this.communicationService.repairCollection();
  }

  @Get('institutions')
  getInstitutions() {
    return this.institutionService.searchActiveInstitutions();
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
    const mails = await this.communicationService.create(communication, account);
    this.groupwareGateway.sendMails(mails);
    return { message: 'Tramite enviado' };
  }

  @Get('inbox')
  getInbox(@GetUserRequest('_id') id_account: string, @Query() paginationParams: GetInboxParamsDto) {
    return this.communicationService.getAccountInbox(id_account, paginationParams);
  }

  @Get('outbox')
  getOutbox(@GetUserRequest('_id') id_account: string, @Query() paginationParams: PaginationParamsDto) {
    return this.communicationService.getAccountOutbox(id_account, paginationParams);
  }

  @Put('accept/:id_mail')
  acceptMail(@Param('id_mail', IsMongoidPipe) id_mail: string) {
    return this.communicationService.acceptMail(id_mail);
  }

  @Put('reject/:id_mail')
  rejectMail(
    @Param('id_mail', IsMongoidPipe) id_mail: string,
    @Body() body: RejectionDetail,
    @GetUserRequest() account: Account,
  ) {
    return this.communicationService.rejectMail(id_mail, body.rejectionReason, account);
  }

  @Delete('outbox/:id_procedure')
  async cancelMails(
    @GetUserRequest('_id') id_account: string,
    @Param('id_procedure') id_procedure: string,
    @Body() body: CancelMailsDto,
  ) {
    const { message, mails } = await this.communicationService.cancelMails(body.ids_mails, id_procedure, id_account);
    this.groupwareGateway.cancelMails(mails);
    return { message };
  }

  @Get('/:id_mail')
  async getMailDetails(@Param('id_mail', IsMongoidPipe) id_mail: string) {
    return await this.communicationService.getMailDetails(id_mail);
  }

  @Get('inbox/search/:text')
  searchInbox(
    @GetUserRequest('_id') id_account: string,
    @Param('text') text: string,
    @Query() paginationParamsDto: GetInboxParamsDto,
  ) {
    return this.communicationService.searchInbox(id_account, text, paginationParamsDto);
  }

  @Get('outbox/search/:text')
  searchOutbox(
    @GetUserRequest('_id') id_account: string,
    @Param('text') text: string,
    @Query() paginationParamsDto: PaginationParamsDto,
  ) {
    return this.communicationService.searchOutbox(id_account, text, paginationParamsDto);
  }
}
