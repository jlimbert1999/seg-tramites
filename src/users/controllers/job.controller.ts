import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { JobService } from '../services';
import { PaginationParamsDto } from 'src/common/dto/pagination.dto';
import { CreateJobDto, UpdateJobDto } from '../dtos';
import { ResourceProtected } from 'src/auth/decorators';
import { validResource } from 'src/auth/interfaces';

@ResourceProtected(validResource.jobs)
@Controller('jobs')
export class JobController {
  constructor(private readonly jobService: JobService) {}

  @Get('search/:term')
  search(@Query() { limit, offset }: PaginationParamsDto, @Param('term') term: string) {
    return this.jobService.search(limit, offset, term);
  }

  @Get()
  get(@Query() { limit, offset }: PaginationParamsDto) {
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
