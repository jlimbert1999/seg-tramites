import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { JobService } from '../services/job.service';
import { UpdateJobDto } from '../dto/update-job.dto';
import { CreateJobDto } from '../dto/create-job.dto';

@Controller('jobs')
export class JobController {
  constructor(private readonly jobService: JobService) {}

  @Get('/generate/collection')
  async generateNewCollection() {
    // ! REMOVE AFTER UPDATE
    return await this.jobService.createNewJobsCollection();
  }
  @Get('/search/job/officer/:text')
  async searchJobForOfficer(@Param('text') text: string) {
    return await this.jobService.searchJobForUser(text);
  }

  @Get('/organization')
  async getOrganization() {
    return await this.jobService.getOrganization();
  }
  @Get('/search/dependents/:text')
  async searchSuperior(@Param('text') text: string) {
    return await this.jobService.searchDependents(text);
  }
  @Get('/dependents/:id')
  async getDependentsOfSuperior(@Param('id') id_superior: string) {
    return await this.jobService.getDependentsOfSuperior(id_superior);
  }
  @Delete('/dependent/:id')
  async removeDependent(@Param('id') id_dependent: string) {
    return await this.jobService.removeDependent(id_dependent);
  }

  @Get()
  async get(@Query('limit', ParseIntPipe) limit: number, @Query('offset', ParseIntPipe) offset: number) {
    return await this.jobService.get(limit, offset);
  }

  @Get('/:text')
  async search(
    @Query('limit', ParseIntPipe) limit: number,
    @Query('offset', ParseIntPipe) offset: number,
    @Param('text') text: string,
  ) {
    return await this.jobService.search(limit, offset, text);
  }

  @Post()
  async add(@Body() job: CreateJobDto) {
    return await this.jobService.add(job);
  }

  @Put('/:id')
  async edit(@Param('id') id: string, @Body() job: UpdateJobDto) {
    return await this.jobService.edit(id, job);
  }
}
