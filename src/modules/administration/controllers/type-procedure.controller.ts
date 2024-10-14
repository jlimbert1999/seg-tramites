import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { TypeProcedureService } from '../services/type-procedure.service';
import { CreateTypeProcedureDto, UpdateTypeProcedureDto } from '../dtos';
import { PaginationDto } from 'src/common';

@Controller('types-procedures')
export class TypeProcedureController {
  constructor(private readonly typeProcedureService: TypeProcedureService) {}

  @Get('segments')
  getSegments() {
    return this.typeProcedureService.getSegments();
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.typeProcedureService.findAll(paginationDto);
  }

  @Post()
  create(@Body() typeProcedure: CreateTypeProcedureDto) {
    return this.typeProcedureService.create(typeProcedure);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() typeProcedure: UpdateTypeProcedureDto,
  ) {
    return this.typeProcedureService.update(id, typeProcedure);
  }
}
