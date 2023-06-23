import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { JobService } from '../services/job.service';
import { UpdateJobDto } from '../dto/update-job.dto';

@Controller('jobs')
export class JobController {

    constructor(private readonly jobService: JobService) {

    }


    @Get('/superiors/:text')
    async searchSuperior(
        @Param('text') text: string
    ) {
        return await this.jobService.searchDependents(text)
    }

    @Get()
    async get(@Query('limit', ParseIntPipe) limit: number, @Query('offset', ParseIntPipe) offset: number) {
        return await this.jobService.get(limit, offset)
    }

    @Get('/:text')
    async search(
        @Query('limit', ParseIntPipe) limit: number,
        @Query('offset', ParseIntPipe) offset: number,
        @Param('text') text: string
    ) {
        return await this.jobService.search(limit, offset, text)
    }

    @Put('/:id')
    async edit(
        @Param('id') id: string,
        @Body() job: UpdateJobDto
    ) {
        return await this.jobService.eidt(id, job)
    }
}
