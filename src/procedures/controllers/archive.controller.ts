import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ArchiveService } from '../services/archive.service';
import { GetUserRequest, ResourceProtected } from 'src/auth/decorators';
import { GroupwareGateway } from 'src/groupware/groupware.gateway';
import { PaginationParamsDto } from 'src/common/dto/pagination.dto';
import { Account } from 'src/users/schemas';
import { VALID_RESOURCES } from 'src/auth/constants';
import { CreateArchiveDto } from '../dto';
import { IsMongoidPipe } from 'src/common/pipes';

@ResourceProtected(VALID_RESOURCES.archived)
@Controller('archives')
export class ArchiveController {
  constructor(private readonly archiveService: ArchiveService, private readonly groupwareGateway: GroupwareGateway) {}

  @Post('mail/:id')
  create(@Param('id', IsMongoidPipe) id: string, @Body() data: CreateArchiveDto, @GetUserRequest() account: Account) {
    return this.archiveService.create(id, account, data);
  }

  @Post('mail/restore/:id_mail')
  async unarchiveMail(@Param('id_mail') id_mail: string, @GetUserRequest() account: Account) {
    const message = await this.archiveService.unarchiveMail(id_mail, account);
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
    return this.archiveService.search(paginationParams, text, account.dependencia._id);
  }
}
