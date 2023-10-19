import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ExternalService } from '../services/external.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { validResources } from 'src/auth/interfaces/valid-resources.interface';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { TypeProcedureService } from 'src/administration/services/type-procedure.service';
import { ProcedureService } from '../services/procedure.service';
import {
  CreateExternalDetailDto,
  CreateProcedureDto,
  UpdateExternalDto,
  UpdateProcedureDto,
} from '../dto';
import { Account } from 'src/auth/schemas/account.schema';

@Controller('external')
@Auth(validResources.external)
export class ExternalController {
  constructor(
    private readonly externalService: ExternalService,
    private readonly typeProcedure: TypeProcedureService,
    private readonly procedureService: ProcedureService,
  ) {}

  @Get('segments')
  async getSegmentsOfTypesProcedures() {
    return await this.typeProcedure.getSegmentsOfTypesProcedures();
  }
  @Get('segments/:segment')
  async getTypesProceduresBySegment(@Param('segment') segment: string) {
    return await this.typeProcedure.getTypeProceduresBySegments(segment);
  }

  @Get('search/:text')
  async search(
    @GetUser('_id') id_account: string,
    @Query('limit', ParseIntPipe) limit: number,
    @Query('offset', ParseIntPipe) offset: number,
    @Param('text') text: string,
  ) {
    return await this.externalService.search(limit, offset, id_account, text);
  }

  @Get()
  async get(
    @GetUser('_id') id_account: string,
    @Query('limit', ParseIntPipe) limit: number,
    @Query('offset', ParseIntPipe) offset: number,
  ) {
    return await this.externalService.findAll(limit, offset, id_account);
  }

  @Post()
  async add(
    @GetUser() account: Account,
    @Body('procedure') procedure: CreateProcedureDto,
    @Body('details') details: CreateExternalDetailDto,
  ) {
    return await this.externalService.create(procedure, details, account);
  }

  @Put('/:id_procedure')
  async edit(
    @Param('id_procedure') id_procedure: string,
    @GetUser('_id') id_account: string,
    @Body('procedure')
    procedure: UpdateProcedureDto,
    @Body('details') details: UpdateExternalDto,
  ) {
    return await this.externalService.update(
      id_procedure,
      id_account,
      procedure,
      details,
    );
  }
}
