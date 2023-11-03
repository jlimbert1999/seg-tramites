import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { InstitutionService, DependencieService, AccountService } from 'src/administration/services';
import { GroupwareGateway } from 'src/groupware/groupware.gateway';
import { CommunicationService, ObservationService } from '../services';
import { Auth, GetUserRequest } from 'src/auth/decorators';
import { validResources } from 'src/auth/interfaces/valid-resources.interface';
import { CancelMailsDto, CreateCommunicationDto, CreateObservationDto, RejectionDetail } from '../dto';
import { Account } from 'src/auth/schemas/account.schema';
import { PaginationParamsDto } from 'src/common/dto/pagination.dto';

@Controller('communication')
@Auth(validResources.communication)
export class CommunicationController {
  constructor(
    private readonly institutionService: InstitutionService,
    private readonly dependencieService: DependencieService,
    private readonly groupwareGateway: GroupwareGateway,
    private readonly observationService: ObservationService,
    private readonly accountService: AccountService,
    private readonly communicationService: CommunicationService,
  ) {}

  @Get('generate')
  async generateCollection() {
    // await this.inboxService.generateCollection();
    return { ok: true };
  }

  @Get('institutions')
  async getInstitutions() {
    return await this.institutionService.getActiveInstitutions();
  }

  @Get('dependencies/:id_institution')
  async getDependencies(@Param('id_institution') id_institution: string) {
    return await this.dependencieService.getActiveDependenciesOfInstitution(id_institution);
  }
  @Get('accounts/:id_dependency')
  async getAcccount(@GetUserRequest('_id') id_account: string, @Param('id_dependency') id_dependency: string) {
    return await this.accountService.getAccountsForSend(id_dependency, id_account);
  }

  @Post()
  async create(@GetUserRequest() account: Account, @Body() communication: CreateCommunicationDto) {
    const mails = await this.communicationService.create(communication, account);
    this.groupwareGateway.sendMails(mails);
    return { message: 'Tramite enviado' };
  }

  @Get('inbox')
  async getInbox(@GetUserRequest('_id') id_account: string, @Query() paginationParams: PaginationParamsDto) {
    return await this.communicationService.getInboxOfAccount(id_account, paginationParams);
  }
  @Get('outbox')
  async getOutbox(@GetUserRequest('_id') id_account: string, @Query() paginationParams: PaginationParamsDto) {
    return await this.communicationService.getOutboxOfAccount(id_account, paginationParams);
  }

  @Put('inbox/accept/:id_mail')
  async acceptMail(@Param('id_mail') id_mail: string) {
    const state = await this.communicationService.acceptMail(id_mail);
    return { state };
  }
  @Put('inbox/reject/:id_mail')
  async rejectMail(@Param('id_mail') id_mail: string, @Body() body: RejectionDetail) {
    await this.communicationService.rejectMail(id_mail, body.rejectionReason);
    return { message: 'Se ha rechazado el tramite correctamente' };
  }

  @Delete('outbox/:id_procedure')
  async cancelMails(
    @GetUserRequest('_id') id_account: string,
    @Body() body: CancelMailsDto,
    @Param('id_procedure') id_procedure: string,
  ) {
    const { message, canceledMails } = await this.communicationService.cancelMails(
      body.ids_mails,
      id_procedure,
      id_account,
    );
    this.groupwareGateway.cancelMails(canceledMails);
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
    @Query() paginationParamsDto: PaginationParamsDto,
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
    return this.observationService.addObservation(id_procedure, account, observationDto);
  }
  @Get('inbox/observations/:id_procedure')
  async getObservations(@Param('id_procedure') id_procedure: string) {
    return this.observationService.getObservationsOfProcedure(id_procedure);
  }
}
