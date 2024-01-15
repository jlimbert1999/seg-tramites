import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { InstitutionService, DependencieService } from 'src/administration/services';
import { GroupwareGateway } from 'src/groupware/groupware.gateway';
import { CommunicationService, ObservationService } from '../services';
import { GetUserRequest } from 'src/auth/decorators';
import {
  CancelMailsDto,
  CreateCommunicationDto,
  CreateObservationDto,
  GetInboxParamsDto,
  RejectionDetail,
} from '../dto';
import { PaginationParamsDto } from 'src/common/dto/pagination.dto';
import { AccountService } from 'src/users/services/account.service';
import { Account } from 'src/users/schemas';

@Controller('communication')
// @Auth(validResources.communication)
export class CommunicationController {
  constructor(
    private readonly accountService: AccountService,
    private readonly institutionService: InstitutionService,
    private readonly dependencieService: DependencieService,
    private readonly observationService: ObservationService,
    private readonly communicationService: CommunicationService,
    private readonly groupwareGateway: GroupwareGateway,
  ) {}

  @Get('repair')
  async repairCollection() {
    await this.communicationService.repairOldSchemas();
    return { ok: true };
  }

  @Get('generate')
  async generateCollection() {
    await this.communicationService.generateCollection();
    return { ok: true };
  }

  @Get('institutions')
  async getInstitutions() {
    return await this.institutionService.searchActiveInstitutions();
  }

  @Get('dependencies/:id_institution')
  async getDependencies(@Param('id_institution') id_institution: string) {
    return await this.dependencieService.getActiveDependenciesOfInstitution(id_institution);
  }

  @Get('accounts/:id_dependency')
  async getAccountsForSend(@GetUserRequest('_id') id_account: string, @Param('id_dependency') id_dependency: string) {
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
    return this.communicationService.getInbox(id_account, paginationParams);
  }

  @Get('outbox')
  getOutbox(@GetUserRequest('_id') id_account: string, @Query() paginationParams: PaginationParamsDto) {
    return this.communicationService.getOutbox(id_account, paginationParams);
  }

  @Put('accept/:id_mail')
  acceptMail(@Param('id_mail') id_mail: string) {
    return this.communicationService.acceptMail(id_mail);
  }

  @Put('reject/:id_mail')
  rejectMail(@Param('id_mail') id_mail: string, @Body() body: RejectionDetail) {
    return this.communicationService.rejectMail(id_mail, body.rejectionReason);
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
  async getMailDetails(@Param('id_mail') id_mail: string) {
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

  @Post('inbox/observation/:id_procedure')
  async addObservation(
    @Param('id_procedure') id_procedure: string,
    @GetUserRequest() account: Account,
    @Body() observationDto: CreateObservationDto,
  ) {
    // return this.observationService.addObservation(id_procedure, account, observationDto);
  }
  @Get('inbox/observations/:id_procedure')
  async getObservations(@Param('id_procedure') id_procedure: string) {
    return this.observationService.getObservationsOfProcedure(id_procedure);
  }
}
