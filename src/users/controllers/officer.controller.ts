import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { JobService, OfficerService } from '../services';
import { CreateOfficerDto, UpdateOfficerDto } from '../dtos';
import { PaginationParamsDto } from 'src/common/dto/pagination.dto';

@Controller('officer')
export class OfficerController {
  constructor(private readonly officerService: OfficerService, private readonly jobService: JobService) {}

  @Get('search/:text')
  async search(
    @Query('limit', ParseIntPipe) limit: number,
    @Query('offset', ParseIntPipe) offset: number,
    @Param('text') text: string,
  ) {
    return await this.officerService.search(limit, offset, text);
  }

  @Get()
  async get(@Query() { limit, offset }: PaginationParamsDto) {
    return await this.officerService.get(limit, offset);
  }

  @Post()
  add(@Body() body: CreateOfficerDto) {
    return this.officerService.create(body);
  }

  @Put('/:id')
  edit(@Param('id') id_officer: string, @Body() officer: UpdateOfficerDto) {
    return this.officerService.edit(id_officer, officer);
  }

  @Delete('/:id')
  delete(@Param('id') id_officer: string) {
    return this.officerService.changeOfficerStatus(id_officer);
  }

  @Get('history/:id')
  getWorkHistory(@Param('id') id_officer: string, @Query('offset', ParseIntPipe) offset: number) {
    return this.officerService.getOfficerWorkHistory(id_officer, offset);
  }

  @Get('jobs/:text')
  searchJobs(@Param('text') term: string) {
    return this.jobService.searchJobForUser(term);
  }

  @Put('unlink/:id_officer')
  unlinkOfficerJob(@Param('id_officer') id_officer: string) {
    return this.officerService.unlinkOfficerJob(id_officer);
  }
}
