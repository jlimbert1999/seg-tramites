import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { InstitutionService } from '../services/institution.service';
import { PaginationParamsDto } from 'src/common/dto/pagination.dto';
import { CreateInstitutionDto, UpdateInstitutionDto } from '../dto';

@Controller('institutions')
export class InstitutionController {
  constructor(private readonly institutionService: InstitutionService) {}

  @Get()
  get(@Query() params: PaginationParamsDto) {
    return this.institutionService.get(params.limit, params.offset);
  }

  @Get('search/:text')
  search(@Query() params: PaginationParamsDto, @Param('text') text: string) {
    return this.institutionService.search(params.limit, params.offset, text);
  }

  @Post()
  add(@Body() institution: CreateInstitutionDto) {
    return this.institutionService.add(institution);
  }

  @Put('/:id')
  edit(@Param('id') id: string, @Body() institution: UpdateInstitutionDto) {
    return this.institutionService.edit(id, institution);
  }

  @Delete('/:id')
  delete(@Param('id') id: string) {
    return this.institutionService.delete(id);
  }
}
