import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ArchiveService } from '../services/archive.service';
import { GetUserRequest, ResourceProtected } from 'src/auth/decorators';
import { EventProcedureDto } from '../dto';
import { GroupwareGateway } from 'src/groupware/groupware.gateway';
import { PaginationParamsDto } from 'src/common/dto/pagination.dto';
import { Account } from 'src/users/schemas';
import { VALID_RESOURCES } from 'src/auth/constants';

@ResourceProtected(VALID_RESOURCES.archived)
@Controller('archive')
export class ArchiveController {
  constructor(private readonly archiveService: ArchiveService, private readonly groupwareGateway: GroupwareGateway) {}

  @Post('procedure')
  archiveProcedure(@Body() eventProcedureDto: EventProcedureDto, @GetUserRequest() account: Account) {
    // return this.archiveService.archiveProcedure(eventProcedureDto, account);
  }

  @Post('mail/:id_mail')
  archiveMail(
    @Param('id_mail') id_mail: string,
    @Body() eventDto: EventProcedureDto,
    @GetUserRequest() account: Account,
  ) {
    return this.archiveService.archiveMail(id_mail, eventDto, account);
  }

  @Post('mail/restore/:id_mail')
  async unarchiveMail(
    @Param('id_mail') id_mail: string,
    @Body() archiveDto: EventProcedureDto,
    @GetUserRequest() account: Account,
  ) {
    const message = await this.archiveService.unarchiveMail(id_mail, archiveDto, account);
    this.groupwareGateway.notifyUnarchive(String(account.dependencia._id), id_mail);
    return { message };
  }

  @Get()
  findAll(@Query() paginationParams: PaginationParamsDto, @GetUserRequest() account: Account) {
    return this.archiveService.findAll(paginationParams, account.dependencia._id);
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
