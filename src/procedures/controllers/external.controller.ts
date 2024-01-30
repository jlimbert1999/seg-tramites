import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { GetUserRequest, ResourceProtected } from 'src/auth/decorators';
import { TypeProcedureService } from 'src/administration/services/type-procedure.service';
import { CreateExternalDetailDto, CreateProcedureDto, UpdateExternalDto, UpdateProcedureDto } from '../dto';
import { ExternalService } from '../services';
import { PaginationParamsDto } from 'src/common/dto/pagination.dto';
import { Account } from 'src/users/schemas';
import { VALID_RESOURCES } from 'src/auth/constants';


@Controller('external')
@ResourceProtected(VALID_RESOURCES.external)
export class ExternalController {
  constructor(
    private readonly externalService: ExternalService,
    private readonly typeProcedure: TypeProcedureService,
  ) {}

  @Get('segments')
  getSegments() {
    return this.typeProcedure.getSegments();
  }
  @Get('segments/:segment')
  async getTypesProceduresBySegment(@Param('segment') segment: string) {
    return await this.typeProcedure.getEnabledTypesBySegment(segment);
  }

  @Get('search/:text')
  async search(
    @GetUserRequest('_id') id_account: string,
    @Query() paginationParamsDto: PaginationParamsDto,
    @Param('text') text: string,
  ) {
    return await this.externalService.search(paginationParamsDto, id_account, text);
  }

  @Get()
  async get(@GetUserRequest('_id') id_account: string, @Query() paginationParamsDto: PaginationParamsDto) {
    return await this.externalService.findAll(paginationParamsDto, id_account);
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
