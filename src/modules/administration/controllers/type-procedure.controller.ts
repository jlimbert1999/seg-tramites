import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { TypeProcedureService } from '../services/type-procedure.service';
import { CreateTypeProcedureDto, UpdateTypeProcedureDto } from '../dtos';

@Controller('types-procedures')
export class TypeProcedureController {
  constructor(private readonly typeProcedureService: TypeProcedureService) {}
  @Get('search/:text')
  async search(
    @Query('limit', ParseIntPipe) limit: number,
    @Query('offset', ParseIntPipe) offset: number,
    @Param('text') text: string,
  ) {
    return await this.typeProcedureService.search(limit, offset, text);
  }
  @Get('/segments')
  getSegments() {
    return this.typeProcedureService.getSegments();
  }
  @Get()
  async get(@Query('limit', ParseIntPipe) limit: number, @Query('offset', ParseIntPipe) offset: number) {
    return await this.typeProcedureService.findAll(limit, offset);
  }

  @Post()
  async add(@Body() typeProcedure: CreateTypeProcedureDto) {
    return await this.typeProcedureService.add(typeProcedure);
  }

  @Put(':id')
  async edit(@Param('id') id_typeProcedure: string, @Body() typeProcedure: UpdateTypeProcedureDto) {
    return await this.typeProcedureService.edit(id_typeProcedure, typeProcedure);
  }

  @Delete(':id')
  async delete(@Param('id') id_typeProcedure: string) {
    return await this.typeProcedureService.delete(id_typeProcedure);
  }
}
