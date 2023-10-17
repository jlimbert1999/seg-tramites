import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ArchiveService } from '../services/archive.service';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { Account } from 'src/administration/schemas';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { PaginationParamsDto } from 'src/shared/interfaces/pagination_params';
import { EventProcedureDto } from '../dto';

@Controller('archive')
@Auth()
export class ArchiveController {
  constructor(private readonly archiveService: ArchiveService) {}

  @Post('procedure/')
  archiveProcedure(
    @Body() eventProcedureDto: EventProcedureDto,
    @GetUser() account: Account,
  ) {
    return this.archiveService.archiveProcedure(eventProcedureDto, account);
  }
  

  @Post('mail/:id_mail')
  archiveMail(
    @Param('id_mail') id_mail: string,
    @Body() archive: EventProcedureDto,
    @GetUser() account: Account,
  ) {
    return this.archiveService.archiveMail(id_mail, archive, account);
  }

  @Post('mail/restart/:id_mail')
  unarchiveMail(
    @Param('id_mail') id_mail: string,
    @Body() archiveDto: EventProcedureDto,
    @GetUser() account: Account,
  ) {
    return this.archiveService.unarchiveMail(id_mail, archiveDto, account);
  }

  @Get()
  findAll(
    @Query() paginationParams: PaginationParamsDto,
    @GetUser() account: Account,
  ) {
    return this.archiveService.findAll(paginationParams, account);
  }
}
