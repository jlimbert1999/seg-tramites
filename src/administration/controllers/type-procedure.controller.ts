import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { TypeProcedureService } from '../services/type-procedure.service';
import { CreateTypeProcedureDto } from '../dto/create-typeProcedure.dto';
import { UpdateTypeProcedureDto } from '../dto/update-typeProcedure.dto';

@Controller('type-procedure')
export class TypeProcedureController {
    constructor(private readonly typeProcedureService: TypeProcedureService) {
    }
    @Get('search/:text')
    async search(
        @Query('limit', ParseIntPipe) limit: number,
        @Query('offset', ParseIntPipe) offset: number,
        @Param('text') text: string
    ) {
        return await this.typeProcedureService.search(limit, offset, text)
    }
    @Get('/segments')
    async getSegments(
    ) {
        return await this.typeProcedureService.getSegmentsOfTypesProcedures()
    }
    @Get()
    async get(@Query('limit', ParseIntPipe) limit: number, @Query('offset', ParseIntPipe) offset: number) {
        return await this.typeProcedureService.get(limit, offset)
    }

    @Post()
    async add(@Body() typeProcedure: CreateTypeProcedureDto) {
        return await this.typeProcedureService.add(typeProcedure)
    }

    @Put(':id')
    async edit(
        @Param('id') id_typeProcedure: string,
        @Body() typeProcedure: UpdateTypeProcedureDto) {
        return await this.typeProcedureService.edit(id_typeProcedure, typeProcedure)
    }

    @Delete(':id')
    async delete(@Param('id') id_typeProcedure: string,) {
        return await this.typeProcedureService.delete(id_typeProcedure)
    }
}
