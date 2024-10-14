import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { TypeProcedureService } from 'src/modules/administration/services/type-procedure.service';
import {
  CreateExternalDetailDto,
  CreateProcedureDto,
  UpdateExternalDto,
  UpdateProcedureDto,
} from '../dto';
import { ExternalService } from '../services';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { SystemResource } from 'src/modules/auth/constants';
import { Account } from 'src/modules/administration/schemas';
import { onlyAssignedAccount } from '../decorators/only-assigned-account.decorator';
import { GetAccountRequest } from '../decorators/get-account-request.decorator';
import { ResourceProtected } from 'src/modules/auth/decorators';

@Controller('external')
@ResourceProtected(SystemResource.EXTERNAL)
@onlyAssignedAccount()
export class ExternalController {
  constructor(
    private readonly externalService: ExternalService,
    private readonly typeProcedure: TypeProcedureService,
  ) {}

  @Get('segments')
  getSegments() {
    return this.typeProcedure.getSegments('EXTERNO');
  }
  @Get('types-procedures/:segment')
  async getTypesProceduresBySegment(@Param('segment') segment: string) {
    return await this.typeProcedure.getEnabledTypesBySegment(
      segment,
      'EXTERNO',
    );
  }

  @Get('search/:text')
  async search(
    @GetAccountRequest('_id') id_account: string,
    @Query() PaginationDto: PaginationDto,
    @Param('text') text: string,
  ) {
    return await this.externalService.search(PaginationDto, id_account, text);
  }

  @Get()
  async get(
    @GetAccountRequest('_id') id_account: string,
    @Query() PaginationDto: PaginationDto,
  ) {
    return await this.externalService.findAll(PaginationDto, id_account);
  }

  @Post()
  async add(
    @GetAccountRequest() account: Account,
    @Body('procedure') procedure: CreateProcedureDto,
    @Body('details') details: CreateExternalDetailDto,
  ) {
    return await this.externalService.create(procedure, details, account);
  }

  @Put('/:id_procedure')
  async edit(
    @Param('id_procedure') id_procedure: string,
    @Body('procedure') procedure: UpdateProcedureDto,
    @Body('details') details: UpdateExternalDto,
  ) {
    return await this.externalService.update(id_procedure, procedure, details);
  }
}
