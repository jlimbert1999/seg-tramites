import { Controller, Get, Post, Body, Query, Param, BadRequestException } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { SearchProcedureByApplicantDto, SearchProcedureByCodeDto, searchProcedureByPropertiesDto } from './dto';
import { Auth, GetUserRequest } from 'src/auth/decorators';
import { PaginationParamsDto } from 'src/common/dto/pagination.dto';
import { TypeProcedureService } from 'src/administration/services';
import { Account } from 'src/auth/schemas/account.schema';

@Controller('reports')
@Auth()
export class ReportsController {
  constructor(private reportsService: ReportsService, private typeProcedureService: TypeProcedureService) {}

  @Get('types-procedures/:text')
  async getTypeProceduresByText(@Param('text') text: string) {
    return await this.typeProcedureService.getTypesProceduresByText(text);
  }
  @Get('procedure/code')
  searchProcedyreByCode(@Query() searchDto: SearchProcedureByCodeDto) {
    return this.reportsService.searchProcedureByCode(searchDto);
  }
  @Post('procedure/:applicant')
  async searchProcedureByApplicant(
    @Param('applicant') applicant: 'solicitante' | 'representante',
    @Body() searchDto: SearchProcedureByApplicantDto,
    @Query() paginationParams: PaginationParamsDto,
  ) {
    if (!['solicitante', 'representante'].includes(applicant)) {
      throw new BadRequestException('Tipo de solicitante no valido');
    }
    return await this.reportsService.searchProcedureByApplicant(applicant, searchDto, paginationParams);
  }
  @Post('procedure')
  searchProcedureByProperties(
    @Body() searchDto: searchProcedureByPropertiesDto,
    @Query() paginationParams: PaginationParamsDto,
  ) {
    return this.reportsService.searchProcedureByProperties(paginationParams, searchDto);
  }

  @Get('dependents')
  getDetailsDependentsByUnit(@GetUserRequest() accont: Account) {
    return this.reportsService.getDetailsDependentsByUnit(accont.dependencia._id);
  }

  @Get('work/details/:id_account')
  getWorkDetailsOfAccount(@Param('id_account') id_account: string) {
    return this.reportsService.getWorkDetailsOfAccount(id_account);
  }
}
