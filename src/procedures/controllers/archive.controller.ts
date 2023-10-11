import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ArchiveService } from '../services/archive.service';
import { CreateArchiveDto } from '../dto';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { Account } from 'src/administration/schemas';
import { Auth } from 'src/auth/decorators/auth.decorator';

@Controller('archive')
@Auth()
export class ArchiveController {
  constructor(private readonly archiveService: ArchiveService) {}
  @Get()
  getOld() {
    return this.archiveService.getOldArchives({ limit: 10, offset: 0 });
  }

  @Post('mail/:id_mail')
  archiveMail(
    @Param('id_mail') id_mail: string,
    @Body() archive: CreateArchiveDto,
    @GetUser() account: Account,
  ) {
    return this.archiveService.archiveMail(id_mail, archive, account);
  }

  @Post('procedure')
  archiveProcedure(
    @Body() archive: CreateArchiveDto,
    @GetUser() account: Account,
  ) {
    return this.archiveService.archiveProcedure(archive, account);
  }
}
