import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { SearchProcedureByApplicantDto, SearchProcedureByPropertiesDto } from './dto';
import { GetUserRequest } from 'src/auth/decorators';
import { PaginationParamsDto } from 'src/common/dto/pagination.dto';
import { InstitutionService, TypeProcedureService } from 'src/administration/services';
import type { Account } from 'src/users/schemas';

@Controller('reports')
export class ReportsController {
  constructor(
    private reportsService: ReportsService,
    private typeProcedureService: TypeProcedureService,
    private institutionService: InstitutionService,
  ) {}

  @Get('types-procedures/:term')
  getTypeProceduresByText(@Param('term') term: string, @Query('type') type: string | undefined) {
    return this.typeProcedureService.getTypesByText(term, type, true);
  }

  @Get('institutions')
  getInstitutions() {
    return this.institutionService.getActiveInstitutions();
  }

  @Post('applicant')
  searchProcedureByApplicant(
    @Body() searchDto: SearchProcedureByApplicantDto,
    @Query() paginationParams: PaginationParamsDto,
  ) {
    return this.reportsService.searchProcedureByApplicant(searchDto, paginationParams);
  }

  @Post('procedure')
  searchProcedureByProperties(
    @Body() searchDto: SearchProcedureByPropertiesDto,
    @Query() paginationParams: PaginationParamsDto,
  ) {
    return this.reportsService.searchProcedureByProperties(paginationParams, searchDto);
  }

  @Get('unlink')
  getAccountInbox(@GetUserRequest() account: Account) {
    return this.reportsService.getUnlinkData(account);
  }

  @Get('communication/total/:id_account')
  getTotalCommunications(@Param('id_account') id: string) {
    return this.reportsService.getTotalCommunications(id);
  }

  @Get('unit/pendings')
  getPendingsByUnit(@GetUserRequest() account: Account) {
    return this.reportsService.getPendingsByUnit(account);
  }

  @Get('pending/:id_account')
  getPendingsByAccount(@Param('id_account') id: string) {
    return this.reportsService.getPendingsByAccount(id);
  }
}
