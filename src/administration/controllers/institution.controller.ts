import { Controller, Get, ParseIntPipe, Query } from '@nestjs/common';
import { InstitutionService } from '../services/institution.service';

@Controller('institutions')
export class InstitutionController {
    constructor(
        private readonly institutionService: InstitutionService
    ) {

    }

    @Get()
    async findAll(@Query('limit', ParseIntPipe) limit: number, @Query('offset', ParseIntPipe) offset: number) {
        return await this.institutionService.findAll(limit, offset)
    }

}
