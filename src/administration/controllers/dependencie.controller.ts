import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { DependencieService } from '../services/dependencie.service';

@Controller('dependencies')
export class DependencieController {
    constructor(
        private readonly dependencyService: DependencieService
    ) {

    }
    @Get()
    async findAll(@Query('limit', ParseIntPipe) limit: number, @Query('offset', ParseIntPipe) offset: number) {
        return await this.dependencyService.findAll(limit, offset)
    }

    @Get('search')
    async findByText(
        @Query('limit', ParseIntPipe) limit: number,
        @Query('offset', ParseIntPipe) offset: number,
        @Query('text') text?: string,
        @Query('institucion') institution?: string
    ) {
        return await this.dependencyService.getFiltered(limit, offset, text, institution)
    }
}
