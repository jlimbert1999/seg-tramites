import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { validResources } from 'src/auth/interfaces/valid-resources.interface';
import { InternalService, OutboxService } from '../services';
import {
  OfficerService,
  TypeProcedureService,
} from 'src/administration/services';
import { Account } from 'src/administration/schemas';
import {
  CreateInternalDetailDto,
  CreateProcedureDto,
  UpdateInternalDetailDto,
  UpdateProcedureDto,
} from '../dto';
import { ProcedureService } from '../services/procedure.service';

@Controller('internal')
@Auth(validResources.internal)
export class InternalController {
  constructor(
    private readonly internalService: InternalService,
    private readonly officerService: OfficerService,
    private readonly typeProcedureService: TypeProcedureService,
    private readonly outboxService: OutboxService,
    private readonly procedureService: ProcedureService,
  ) {}
  @Get('/types-procedures')
  async getTypesProcedures() {
    return await this.typeProcedureService.getTypesProceduresByGroup('INTERNO');
  }
  @Get('/participant/:text')
  async findParticipantForProcess(@Param('text') text: string) {
    return await this.officerService.findOfficerForProcess(text);
  }

  @Get('search/:text')
  async search(
    @GetUser('_id') id_account: string,
    @Param('text') text: string,
    @Query('limit', ParseIntPipe) limit: number,
    @Query('offset', ParseIntPipe) offset: number,
  ) {
    return await this.internalService.search(limit, offset, id_account, text);
  }

  @Get()
  async get(
    @GetUser('_id') id_account: string,
    @Query('limit', ParseIntPipe) limit: number,
    @Query('offset', ParseIntPipe) offset: number,
  ) {
    return await this.internalService.findAll(limit, offset, id_account);
  }

  @Post()
  async add(
    @GetUser() account: Account,
    @Body('procedure') procedure: CreateProcedureDto,
    @Body('details') details: CreateInternalDetailDto,
  ) {
    return await this.internalService.add(procedure, details, account);
  }

  @Put('/:id_procedure')
  async edit(
    @Param('id_procedure') id_procedure: string,
    @GetUser('_id') id_account: string,
    @Body('procedure')
    procedure: UpdateProcedureDto,
    @Body('details') details: UpdateInternalDetailDto,
  ) {
    return await this.internalService.update(
      id_procedure,
      id_account,
      procedure,
      details,
    );
  }

  @Get('/:id_procedure')
  async getOne(@Param('id_procedure') id_procedure: string) {
    const [procedure, workflow] = await Promise.all([
      this.procedureService.getProcedure(id_procedure),
      this.outboxService.getWorkflowProcedure(id_procedure),
    ]);
    return {
      procedure,
      workflow,
    };
  }
}
