import { Body, Controller, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { TypeProcedureService } from '../services/type-procedure.service';
import { CreateTypeProcedureDto } from '../dto/create-typeProcedure.dto';

@Controller('type-procedure')
export class TypeProcedureController {
    constructor(private readonly typeProcedureService: TypeProcedureService) {
    }
    @Get('/search/:text')
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
    }u
    @Get()
    async get(@Query('limit', ParseIntPipe) limit: number, @Query('offset', ParseIntPipe) offset: number) {
        return await this.typeProcedureService.get(limit, offset)
    }

    @Post()
    async add(@Body() typeProcedure: CreateTypeProcedureDto) {
        return await this.typeProcedureService.add(typeProcedure)
    }
}
