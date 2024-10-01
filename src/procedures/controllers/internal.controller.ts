import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { GetUserRequest, ResourceProtected } from 'src/auth/decorators';
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
import { SystemResource } from 'src/auth/constants';
import { Account } from 'src/modules/administration/schemas';

@ResourceProtected(SystemResource.INTERNAL)
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
    @GetUserRequest('_id') id_account: string,
    @Param('text') text: string,
    @Query() PaginationDto: PaginationDto,
  ) {
    return await this.internalService.search(PaginationDto, id_account, text);
  }

  @Get()
  async get(
    @GetUserRequest('_id') id_account: string,
    @Query() PaginationDto: PaginationDto,
  ) {
    return await this.internalService.findAll(PaginationDto, id_account);
  }

  @Post()
  async add(
    @GetUserRequest() account: Account,
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
