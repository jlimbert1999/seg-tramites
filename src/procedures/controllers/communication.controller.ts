import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { InstitutionService, DependencieService } from 'src/administration/services';
import { GroupwareGateway } from 'src/groupware/groupware.gateway';
import { CommunicationService } from '../services';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { validResources } from 'src/auth/interfaces/valid-resources.interface';
import { PaginationParamsDto } from 'src/shared/interfaces/pagination_params';
import { CancelMailsDto, CreateCommunicationDto, CreateObservationDto, RejectionDetail } from '../dto';
import { ObservationService } from '../services/observation.service';
import { Account } from 'src/auth/schemas/account.schema';

@Controller('communication')
@Auth(validResources.communication)
export class CommunicationController {
  constructor(
    private readonly institutionService: InstitutionService,
    private readonly dependencieService: DependencieService,
    private readonly groupwareGateway: GroupwareGateway,
    private readonly communicationService: CommunicationService,
    private readonly observationService: ObservationService,
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
  async getAcccount(@GetUser('_id') id_account: string, @Param('id_dependency') id_dependency: string) {
    return await this.communicationService.getAccountsForSend(id_dependency, id_account);
  }

  @Post()
  async create(@GetUser() account: Account, @Body() communication: CreateCommunicationDto) {
    const mails = await this.communicationService.create(communication, account);
    this.groupwareGateway.sendMails(mails);
    return { message: 'Tramite enviado' };
  }

  @Get('inbox')
  async getInbox(@GetUser('_id') id_account: string, @Query() paginationParams: PaginationParamsDto) {
    return await this.communicationService.getInboxOfAccount(id_account, paginationParams);
  }
  @Get('outbox')
  async getOutbox(@GetUser('_id') id_account: string, @Query() paginationParams: PaginationParamsDto) {
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
    @GetUser('_id') id_account: string,
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
  @Get('search/:text')
  async search(
    @GetUser('_id')
    id_account: string,
    @Param('text') text: string,
    @Query('offset', ParseIntPipe) offset: number,
    @Query('limit', ParseIntPipe) limit: number,
  ) {
    // return await this.inboxService.search(id_account, text, limit, offset);
  }

  @Post('inbox/observation/:id_procedure')
  async addObservation(
    @Param('id_procedure') id_procedure: string,
    @GetUser()
    account: Account,
    @Body() observationDto: CreateObservationDto,
  ) {
    return this.observationService.addObservation(id_procedure, account, observationDto);
  }
  @Get('inbox/observations/:id_procedure')
  async getObservations(@Param('id_procedure') id_procedure: string) {
    return this.observationService.getObservationsOfProcedure(id_procedure);
  }
}
