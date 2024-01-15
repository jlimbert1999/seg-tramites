import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,

} from '@nestjs/common';
import { JobService, OfficerService } from '../services';
import { CreateOfficerDto } from '../dtos';
import { PaginationParamsDto } from 'src/common/dto/pagination.dto';

@Controller('officer')
export class OfficerController {
  constructor(private readonly officerService: OfficerService, private jobService: JobService) {}

  @Get('search/:text')
  async search(
    @Query('limit', ParseIntPipe) limit: number,
    @Query('offset', ParseIntPipe) offset: number,
    @Param('text') text: string,
  ) {
    return await this.officerService.search(limit, offset, text);
  }
  @Get('history/:id')
  async getWorkHistory(
    @Param('id') id_officer: string,
    @Query('limit', ParseIntPipe) limit: number,
    @Query('offset', ParseIntPipe) offset: number,
  ) {
    return await this.officerService.getOfficerWorkHistory(id_officer, limit, offset);
  }

  @Get()
  async get(@Query() { limit, offset }: PaginationParamsDto) {
    return await this.officerService.get(limit, offset);
  }

  @Get('jobs/:text')
  searchJobs(@Param('text') term: string) {
    return this.jobService.searchJobForUser(term);
  }

  @Post()
  async add(@Body() body: CreateOfficerDto) {
    return this.officerService.create(body);
  }

  //   @Put('/:id')
  //   async edit(@Param('id') id_officer: string, @Body() officer: UpdateOfficerDto) {
  //     return await this.officerService.edit(id_officer, officer);
  //   }

  @Delete('/:id')
  async delete(@Param('id') id_officer: string) {
    return await this.officerService.delete(id_officer);
  }
}
