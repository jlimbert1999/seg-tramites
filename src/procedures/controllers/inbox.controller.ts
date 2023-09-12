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
import { validResources } from 'src/auth/interfaces/valid-resources.interface';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import {
  DependencieService,
  InstitutionService,
} from 'src/administration/services';
import { InboxService, OutboxService } from '../services';
import { Account } from 'src/administration/schemas';
import { CreateInboxDto } from '../dto/create-inbox.dto';
import { GroupwareGateway } from 'src/groupware/groupware.gateway';

@Controller('inbox')
@Auth(validResources.inbox)
export class InboxController {
  constructor(
    private readonly inboxService: InboxService,
    private readonly outboxService: OutboxService,
    private readonly institutionService: InstitutionService,
    private readonly dependencieService: DependencieService,
    private readonly groupwareGateway: GroupwareGateway,
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

  @Get()
  async get(
    @GetUser('_id') id_account: string,
    @Query('offset', ParseIntPipe) offset: number,
    @Query('limit', ParseIntPipe) limit: number,
  ) {
    return await this.inboxService.findAll(id_account, limit, offset);
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

  @Post()
  async add(@GetUser() account: Account, @Body() inbox: CreateInboxDto) {
    const mails = await this.inboxService.create(inbox, account);
    this.groupwareGateway.sendMail(mails);
    return { message: 'Tramite enviado' };
  }

  @Get('/:id')
  async getMail(@Param('id') id_mail: string) {
    return await this.inboxService.getMail(id_mail);
  }

  @Put('accept/:id')
  async aceptMail(@Param('id') id_mail: string) {
    return await this.inboxService.acceptMail(id_mail);
  }
  @Put('reject/:id')
  async rejectMail(@Param('id') id_mail: string) {
    return await this.inboxService.rejectMail(id_mail, 'esta mal');
  }
}
