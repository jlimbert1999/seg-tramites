import { Controller, Get, Post, Body, Query, Param, BadRequestException } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { SearchProcedureByApplicantDto, SearchProcedureByCodeDto } from './dto';
import { Auth } from 'src/auth/decorators';
import { PaginationParamsDto } from 'src/common/dto/pagination.dto';

@Controller('reports')
// @Auth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('procedure/code')
  searchProcedyreByCode(@Query() searchDto: SearchProcedureByCodeDto) {
    return this.reportsService.searchProcedureByCode(searchDto);
  }
  @Post('procedure/:applicant')
  async searchProcedyreByApplicant(
    @Param('applicant') applicant: 'solicitante' | 'representante',
    @Body() searchDto: SearchProcedureByApplicantDto,
    @Query() paginationParams: PaginationParamsDto,
  ) {
    if (!['solicitante', 'representante'].includes(applicant)) {
      throw new BadRequestException('Tipo de solicitante no valido');
    }
    return await this.reportsService.searchProcedureByApplicant(applicant, searchDto, paginationParams);
  }
  @Get('work/details/:id_account')
  getWorkDetailsOfAccount(@Param('id_account') id_account: string) {
    return this.reportsService.getWorkDetailsOfAccount(id_account);
  }
}
