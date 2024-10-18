import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
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
  AccountService,
  OfficerService,
  TypeProcedureService,
} from 'src/modules/administration/services';
import { SystemResource } from 'src/modules/auth/constants';
import { Account } from 'src/modules/administration/schemas';
import { onlyAssignedAccount } from '../decorators/only-assigned-account.decorator';
import { GetAccountRequest } from '../decorators/get-account-request.decorator';
import {
  CreateInternalProcedureDto,
  UpdateInternalProcedureDto,
} from '../dtos';

@ResourceProtected(SystemResource.INTERNAL)
@onlyAssignedAccount()
@Controller('internal')
export class InternalController {
  constructor(
    private readonly accountService: AccountService,
    private readonly internalService: InternalService,
    private readonly typeProcedureService: TypeProcedureService,
  ) {}
  
  @Get('types-procedures')
  async getTypesProcedures() {
    return await this.typeProcedureService.getEnabledTypesByGroup('INTERNO');
  }

  @Get('participant/:text')
  findParticipantForProcess(@Param('text') text: string) {
    return this.accountService.searchActiveAccounts(text);
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
  create(
    @GetAccountRequest() account: Account,
    @Body() procedureDto: CreateInternalProcedureDto,
  ) {
    return this.internalService.create(procedureDto, account);
  }

  @Patch(':id')
  update(
    @Param('id') procedureId: string,
    @Body() procedureDto: UpdateInternalProcedureDto,
  ) {
    return this.internalService.update(procedureId, procedureDto);
  }
}
