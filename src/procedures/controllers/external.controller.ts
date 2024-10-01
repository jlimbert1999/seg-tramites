import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { GetUserRequest, ResourceProtected } from 'src/auth/decorators';
import { TypeProcedureService } from 'src/modules/administration/services/type-procedure.service';
import { CreateExternalDetailDto, CreateProcedureDto, UpdateExternalDto, UpdateProcedureDto } from '../dto';
import { ExternalService } from '../services';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { SystemResource } from 'src/auth/constants';
import { Account } from 'src/modules/administration/schemas';

@Controller('external')
@ResourceProtected(SystemResource.EXTERNAL)
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
    return await this.typeProcedure.getEnabledTypesBySegment(segment, 'EXTERNO');
  }

  @Get('search/:text')
  async search(
    @GetUserRequest('_id') id_account: string,
    @Query() PaginationDto: PaginationDto,
    @Param('text') text: string,
  ) {
    return await this.externalService.search(PaginationDto, id_account, text);
  }

  @Get()
  async get(@GetUserRequest('_id') id_account: string, @Query() PaginationDto: PaginationDto) {
    return await this.externalService.findAll(PaginationDto, id_account);
  }

  @Post()
  async add(
    @GetUserRequest() account: Account,
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
