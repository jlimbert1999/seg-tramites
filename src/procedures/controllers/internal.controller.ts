import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { Auth, GetUserRequest } from 'src/auth/decorators';
import { validResources } from 'src/auth/interfaces/valid-resources.interface';
import { PaginationParamsDto } from 'src/common/dto/pagination.dto';
import { Account } from 'src/auth/schemas/account.schema';
import { CreateInternalDetailDto, CreateProcedureDto, UpdateInternalDetailDto, UpdateProcedureDto } from '../dto';
import { InternalService } from '../services';
import { OfficerService, TypeProcedureService } from 'src/administration/services';

@Controller('internal')
@Auth(validResources.internal)
export class InternalController {
  constructor(
    private readonly internalService: InternalService,
    private readonly officerService: OfficerService,
    private readonly typeProcedureService: TypeProcedureService,
  ) {}
  @Get('types-procedures')
  async getTypesProcedures() {
    return await this.typeProcedureService.getEnabledTypesByGroup('INTERNO');
  }
  @Get('participant/:text')
  async findParticipantForProcess(@Param('text') text: string) {
    return await this.officerService.findOfficerForProcess(text);
  }

  @Get('search/:text')
  async search(
    @GetUserRequest('_id') id_account: string,
    @Param('text') text: string,
    @Query() paginationParamsDto: PaginationParamsDto,
  ) {
    return await this.internalService.search(paginationParamsDto, id_account, text);
  }

  @Get()
  async get(@GetUserRequest('_id') id_account: string, @Query() paginationParamsDto: PaginationParamsDto) {
    return await this.internalService.findAll(paginationParamsDto, id_account);
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
