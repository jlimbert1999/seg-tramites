import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ArchiveService } from '../services/archive.service';
import { ArchiveDto } from '../dto';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { Account } from 'src/administration/schemas';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { PaginationParamsDto } from 'src/shared/interfaces/pagination_params';

@Controller('archive')
@Auth()
export class ArchiveController {
  constructor(private readonly archiveService: ArchiveService) {}

  // @Get()
  // getOld() {
  //   return this.archiveService.getOldArchives({ limit: 10, offset: 0 });
  // }

  @Get()
  findAll(
    @Query() paginationParams: PaginationParamsDto,
    @GetUser() account: Account,
  ) {
    return this.archiveService.findAll(paginationParams, account);
  }

  @Post('mail/:id_mail')
  archiveMail(
    @Param('id_mail') id_mail: string,
    @Body() archive: ArchiveDto,
    @GetUser() account: Account,
  ) {
    return this.archiveService.archiveMail(id_mail, archive, account);
  }

  @Post('procedure/:id_procedure')
  archiveProcedure(
    @Param('id_procedure') id_procedure: string,
    @Body() archive: ArchiveDto,
    @GetUser() account: Account,
  ) {
    return this.archiveService.archiveProcedure(id_procedure, archive, account);
  }
}
