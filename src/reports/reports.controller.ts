import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common';
import { ReportsService } from './reports.service';
import {
  SearchProcedureByApplicantDto,
  SearchProcedureByPropertiesDto,
  searchProcedureByUnitDto,
  GetTotalMailsDto,
  GetTotalProceduresDto,
} from './dto';
import { GetUserRequest } from 'src/auth/decorators';
import { PaginationParamsDto } from 'src/common/dto/pagination.dto';
import { InstitutionService, TypeProcedureService } from 'src/administration/services';
import { Account } from 'src/users/schemas';

@Controller('reports')
export class ReportsController {
  constructor(
    private reportsService: ReportsService,
    private typeProcedureService: TypeProcedureService,
    private institutionService: InstitutionService,
  ) {}

  @Get('types-procedures/:text')
  async getTypeProceduresByText(@Param('text') text: string) {
    return await this.typeProcedureService.getTypesProceduresByText(text);
  }
  @Get('dependency/accounts')
  getOfficersInMyDependency(@GetUserRequest() account: Account) {
    return this.reportsService.getOfficersInDependency(account.dependencia._id);
  }
  @Get('institutions')
  getInstitutions() {
    return this.institutionService.searchActiveInstitutions();
  }

  @Post('applicant/:type')
  searchProcedureByApplicant(
    @Param('type') type: 'solicitante' | 'representante',
    @Body() searchDto: SearchProcedureByApplicantDto,
    @Query() paginationParams: PaginationParamsDto,
  ) {
    return this.reportsService.searchProcedureByApplicant(type, searchDto, paginationParams);
  }
  @Post('procedure')
  searchProcedureByProperties(
    @Body() searchDto: SearchProcedureByPropertiesDto,
    @Query() paginationParams: PaginationParamsDto,
  ) {
    return this.reportsService.searchProcedureByProperties(paginationParams, searchDto);
  }
  @Post('unit')
  searchProcedureByUnit(
    @Body() searchDto: searchProcedureByUnitDto,
    @Query() paginationParams: PaginationParamsDto,
    @GetUserRequest() account: Account,
  ) {
    return this.reportsService.searchProcedureByUnit(account.dependencia._id, searchDto, paginationParams);
  }

  @Get('dependents')
  getDetailsDependentsByUnit(@GetUserRequest() accont: Account) {
    return this.reportsService.getDetailsDependentsByUnit(accont.dependencia._id);
  }

  @Get('work/details/:id_account')
  getWorkDetailsOfAccount(@Param('id_account') id_account: string) {
    return this.reportsService.getWorkDetailsOfAccount(id_account);
  }

  @Get('total/communications/:id_institution')
  getTotalMailsByInstitution(@Param('id_institution') id_procedure: string, @Query() params: GetTotalMailsDto) {
    return this.reportsService.getTotalMailsByInstitution(id_procedure, params);
  }

  @Get('total/procedures/:id_institution')
  getTotalProceduresByInstitution(
    @Param('id_institution') id_procedure: string,
    @Query() params: GetTotalProceduresDto,
  ) {
    return this.reportsService.getTotalProceduresByInstitution(id_procedure, params);
  }

  @Get('ranking/accounts')
  getRankingAccounts() {
    return this.reportsService.getTotalInboxByUser();
  }

  @Get('pendings')
  getAccountInbox(@GetUserRequest() account: Account) {
    return this.reportsService.getAccountInbox(account);
  }
}
