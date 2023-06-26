import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { TypeProcedureService } from '../services/type-procedure.service';

@Controller('type-procedure')
export class TypeProcedureController {
    constructor(private readonly typeProcedureService: TypeProcedureService) {
    }
    @Get()
    async get(@Query('limit', ParseIntPipe) limit: number, @Query('offset', ParseIntPipe) offset: number) {
        return await this.typeProcedureService.get(limit, offset)
    }

    @Get('/search/:text')
    async search(
        @Query('limit', ParseIntPipe) limit: number,
        @Query('offset', ParseIntPipe) offset: number,
        @Param('text') text: string
    ) {
        return await this.typeProcedureService.search(limit, offset, text)
    }

}
