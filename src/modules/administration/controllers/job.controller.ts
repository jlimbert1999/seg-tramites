import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { JobService } from '../services';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { ResourceProtected } from 'src/auth/decorators';
import { SystemResource } from 'src/auth/constants';
import { CreateJobDto, UpdateJobDto } from '../dtos';

@ResourceProtected(SystemResource.jobs)
@Controller('jobs')
export class JobController {
  constructor(private readonly jobService: JobService) {}

  @Get('search/:term')
  search(@Query() { limit, offset }: PaginationDto, @Param('term') term: string) {
    return this.jobService.search(limit, offset, term);
  }

  @Get()
  get(@Query() { limit, offset }: PaginationDto) {
    return this.jobService.findAll(limit, offset);
  }

  @Post()
  create(@Body() job: CreateJobDto) {
    return this.jobService.create(job);
  }

  @Patch(':id_job')
  update(@Param('id_job') id_job: string, @Body() job: UpdateJobDto) {
    return this.jobService.edit(id_job, job);
  }
}
