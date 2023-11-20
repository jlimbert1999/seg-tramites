import { Controller, Get, Post, Body, Query, Param, BadRequestException } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { SearchProcedureByApplicantDto, SearchProcedureByCodeDto, searchProcedureByPropertiesDto } from './dto';
import { Auth } from 'src/auth/decorators';
import { PaginationParamsDto } from 'src/common/dto/pagination.dto';
import { TypeProcedureService } from 'src/administration/services';

@Controller('reports')
@Auth()
export class ReportsController {
  constructor(private reportsService: ReportsService, private typeProcedureService: TypeProcedureService) {}

  @Get('procedure/segments/:type')
  async getSegmentsOfTypesProcedures(@Param('type') type: string) {
    return await this.typeProcedureService.getSegmentsOfTypesProcedures(type);
  }
  @Get('procedure/segment/:segment')
  async getTypesProceduresBySegment(@Param('segment') segment: string) {
    return await this.typeProcedureService.getTypeProceduresBySegments(segment);
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
  @Get('work/details/:id_account')
  getWorkDetailsOfAccount(@Param('id_account') id_account: string) {
    return this.reportsService.getWorkDetailsOfAccount(id_account);
  }
}
