import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { InstitutionService } from '../services/institution.service';
import { UpdateInstitutionDto } from '../dto/update-institution.dto';
import { CreateInstitutionDto } from '../dto/create-institution.dto';

@Controller('institutions')
export class InstitutionController {
    constructor(
        private readonly institutionService: InstitutionService
    ) {

    }

    @Get()
    async get(@Query('limit', ParseIntPipe) limit: number, @Query('offset', ParseIntPipe) offset: number) {
        return await this.institutionService.get(limit, offset)
    }

    @Get('search/:text')
    async search(
        @Query('limit', ParseIntPipe) limit: number,
        @Query('offset', ParseIntPipe) offset: number,
        @Param('text') text: string) {
        return await this.institutionService.search(limit, offset, text)
    }


    @Post()
    async add(
        @Body() institution: CreateInstitutionDto) {
        return await this.institutionService.add(institution)
    }

    @Put('/:id')
    async edit(
        @Param('id') id: string,
        @Body() institution: UpdateInstitutionDto) {
        return await this.institutionService.edit(id, institution)
    }

    @Delete('/:id')
    async delete(
        @Param('id') id: string) {
        return await this.institutionService.delete(id)
    }

}
