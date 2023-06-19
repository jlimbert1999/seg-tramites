import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { DependencieService } from '../services/dependencie.service';
import { InstitutionService } from '../services';
import { UpdateDependencyDto } from '../dto/update-dependency.dto';
import { CreateDependencyDto } from '../dto/create-dependency.dto';

@Controller('dependencies')
export class DependencyController {
    constructor(
        private readonly dependencyService: DependencieService,
        private readonly institutionService: InstitutionService,
    ) {

    }
    @Get('institutions')
    async getInstitutions() {
        return await this.institutionService.getActiveInstitutions();
    }

    @Get()
    async get(@Query('limit', ParseIntPipe) limit: number, @Query('offset', ParseIntPipe) offset: number) {
        return await this.dependencyService.get(limit, offset)
    }

    @Get('search/:text')
    async findByText(
        @Query('limit', ParseIntPipe) limit: number,
        @Query('offset', ParseIntPipe) offset: number,
        @Param('text') text: string
    ) {
        return await this.dependencyService.search(limit, offset, text)
    }

    @Put('/:id')
    async edit(
        @Param('id') id: string,
        @Body() dependency: UpdateDependencyDto) {
        return await this.dependencyService.edit(id, dependency)
    }


    @Post()
    async add(
        @Body() dependency: CreateDependencyDto) {
        return await this.dependencyService.add(dependency)
    }


    @Delete('/:id')
    async delete(
        @Param('id') id: string) {
        return await this.dependencyService.delete(id)
    }
}
