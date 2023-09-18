import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  InstitutionService,
  DependencieService,
} from 'src/administration/services';
import { GroupwareGateway } from 'src/groupware/groupware.gateway';
import { CommunicationService, InboxService, OutboxService } from '../services';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { validResources } from 'src/auth/interfaces/valid-resources.interface';
import { PaginationParamsDto } from 'src/shared/interfaces/pagination_params';
import { CreateCommunicationDto, RejectionDetail } from '../dto';
import { Account } from 'src/administration/schemas';

@Controller('communication')
@Auth(validResources.inbox)
export class CommunicationController {
  constructor(
    private readonly inboxService: InboxService,
    private readonly outboxService: OutboxService,
    private readonly institutionService: InstitutionService,
    private readonly dependencieService: DependencieService,
    private readonly groupwareGateway: GroupwareGateway,
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

  @Post()
  async create(
    @GetUser() account: Account,
    @Body() communication: CreateCommunicationDto,
  ) {
    const mails = await this.inboxService.create(communication, account);
    this.groupwareGateway.sendMail(mails);
    return { message: 'Tramite enviado' };
  }

  @Get('inbox')
  async getInbox(
    @GetUser('_id') id_account: string,
    @Query() paginationParams: PaginationParamsDto,
  ) {
    return await this.inboxService.findAll(id_account, paginationParams);
  }

  @Put('inbox/accept/:id_mail')
  async acceptMail(@Param('id_mail') id_mail: string) {
    const state = await this.inboxService.acceptMail(id_mail);
    return { state };
  }
  @Put('inbox/reject/:id_mail')
  async rejectMail(
    @Param('id_mail') id_mail: string,
    @Body() body: RejectionDetail,
  ) {
    await this.inboxService.rejectMail(id_mail, body.rejectionReason);
    return { message: 'Se ha rechazado el tramite correctamente' };
  }

  @Get('outbox')
  async getOutbox(
    @GetUser('_id') id_account: string,
    @Query() paginationParams: PaginationParamsDto,
  ) {
    return await this.outboxService.findAll(id_account, paginationParams);
  }
  @Get('outbox/workflow/:id_procedure')
  async getWorkflow(@GetUser('id_procedure') id_procedure: string) {
    return await this.outboxService.getWorkflowProcedure(id_procedure);
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
