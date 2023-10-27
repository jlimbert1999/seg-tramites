import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ArchiveService } from '../services/archive.service';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { PaginationParamsDto } from 'src/common/interfaces/pagination_params';
import { EventProcedureDto } from '../dto';
import { GroupwareGateway } from 'src/groupware/groupware.gateway';
import { Account } from 'src/auth/schemas/account.schema';

@Controller('archive')
@Auth()
export class ArchiveController {
  constructor(private readonly archiveService: ArchiveService, private readonly groupwareGateway: GroupwareGateway) {}

  @Post('procedure')
  archiveProcedure(@Body() eventProcedureDto: EventProcedureDto, @GetUser() account: Account) {
    return this.archiveService.archiveProcedure(eventProcedureDto, account);
  }

  @Post('mail/:id_mail')
  archiveMail(@Param('id_mail') id_mail: string, @Body() eventDto: EventProcedureDto, @GetUser() account: Account) {
    return this.archiveService.archiveMail(id_mail, eventDto, account);
  }

  @Post('mail/restart/:id_mail')
  async unarchiveMail(
    @Param('id_mail') id_mail: string,
    @Body() archiveDto: EventProcedureDto,
    @GetUser() account: Account,
  ) {
    // await this.archiveService.unarchiveMail(id_mail, archiveDto, account);
    this.groupwareGateway.notifyUnarchive(String(account.dependencia._id), id_mail);
    return { message: 'Desarchivo' };
  }

  @Get('events/:id_procedure')
  async getProcedureEvents(@Param('id_procedure') id_procedure: string) {
    return this.archiveService.getProcedureEvents(id_procedure);
  }

  @Get()
  findAll(@Query() paginationParams: PaginationParamsDto, @GetUser() account: Account) {
    return this.archiveService.findAll(paginationParams, account);
  }
  @Get('search/:text')
  searc(@Query() paginationParams: PaginationParamsDto, @GetUser() account: Account, @Param('text') text: string) {
    return this.archiveService.search(text, paginationParams, account);
  }
}
