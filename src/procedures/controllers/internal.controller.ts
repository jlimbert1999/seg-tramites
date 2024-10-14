import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ResourceProtected } from 'src/modules/auth/decorators';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import {
  CreateInternalDetailDto,
  CreateProcedureDto,
  UpdateInternalDetailDto,
  UpdateProcedureDto,
} from '../dto';
import { InternalService } from '../services';
import {
  OfficerService,
  TypeProcedureService,
} from 'src/modules/administration/services';
import { SystemResource } from 'src/modules/auth/constants';
import { Account } from 'src/modules/administration/schemas';
import { onlyAssignedAccount } from '../decorators/only-assigned-account.decorator';
import { GetAccountRequest } from '../decorators/get-account-request.decorator';

@ResourceProtected(SystemResource.INTERNAL)
@onlyAssignedAccount()
@Controller('internal')
export class InternalController {
  constructor(
    private readonly officerService: OfficerService,
    private readonly internalService: InternalService,
    private readonly typeProcedureService: TypeProcedureService,
  ) {}
  @Get('types-procedures')
  async getTypesProcedures() {
    return await this.typeProcedureService.getEnabledTypesByGroup('INTERNO');
  }
  @Get('participant/:text')
  findParticipantForProcess(@Param('text') text: string) {
    return this.officerService.findOfficersForProcess(text);
  }

  @Get('search/:text')
  async search(
    @GetAccountRequest('_id') id_account: string,
    @Param('text') text: string,
    @Query() PaginationDto: PaginationDto,
  ) {
    return await this.internalService.search(PaginationDto, id_account, text);
  }

  @Get()
  async get(
    @GetAccountRequest('_id') id_account: string,
    @Query() PaginationDto: PaginationDto,
  ) {
    return await this.internalService.findAll(PaginationDto, id_account);
  }

  @Post()
  async add(
    @GetAccountRequest() account: Account,
    @Body('procedure') procedure: CreateProcedureDto,
    @Body('details') details: CreateInternalDetailDto,
  ) {
    return await this.internalService.create(procedure, details, account);
  }

  @Put('/:id_procedure')
  async edit(
    @Param('id_procedure') id_procedure: string,
    @Body('procedure') procedure: UpdateProcedureDto,
    @Body('details') details: UpdateInternalDetailDto,
  ) {
    return await this.internalService.update(id_procedure, procedure, details);
  }
}
