import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ArchiveService } from '../services/archive.service';
import { Auth, GetUserRequest } from 'src/auth/decorators';
import { EventProcedureDto } from '../dto';
import { GroupwareGateway } from 'src/groupware/groupware.gateway';
import { Account } from 'src/auth/schemas/account.schema';
import { PaginationParamsDto } from 'src/common/dto/pagination.dto';

@Controller('archive')
// @Auth()
export class ArchiveController {
  constructor(private readonly archiveService: ArchiveService, private readonly groupwareGateway: GroupwareGateway) {}

  @Get('repair')
  async repailCollectionArchives() {
    return this.archiveService.repiarOldArchives();
  }
  @Get('generate/events')
  async generateObservatons() {
    return this.archiveService.createEvents();
  }

  @Post('procedure')
  archiveProcedure(@Body() eventProcedureDto: EventProcedureDto, @GetUserRequest() account: Account) {
    return this.archiveService.archiveProcedure(eventProcedureDto, account);
  }

  @Post('mail/:id_mail')
  archiveMail(
    @Param('id_mail') id_mail: string,
    @Body() eventDto: EventProcedureDto,
    @GetUserRequest() account: Account,
  ) {
    return this.archiveService.archiveMail(id_mail, eventDto, account);
  }

  @Post('mail/restart/:id_mail')
  async unarchiveMail(
    @Param('id_mail') id_mail: string,
    @Body() archiveDto: EventProcedureDto,
    @GetUserRequest() account: Account,
  ) {
    const message = await this.archiveService.unarchiveMail(id_mail, archiveDto, account);
    this.groupwareGateway.notifyUnarchive(String(account.dependencia._id), id_mail);
    return { message };
  }

  @Get('events/:id_procedure')
  async getProcedureEvents(@Param('id_procedure') id_procedure: string) {
    return this.archiveService.getProcedureEvents(id_procedure);
  }

  @Get()
  findAll(@Query() paginationParams: PaginationParamsDto, @GetUserRequest() account: Account) {
    return this.archiveService.findAll(paginationParams, account);
  }

  @Get('search/:text')
  searc(
    @Query() paginationParams: PaginationParamsDto,
    @GetUserRequest() account: Account,
    @Param('text') text: string,
  ) {
    return this.archiveService.search(text, paginationParams, account);
  }
}
