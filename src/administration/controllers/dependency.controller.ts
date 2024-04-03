import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { InstitutionService, DependencieService } from '../services';
import { UpdateDependencyDto, CreateDependencyDto } from '../dto';
import { PaginationParamsDto } from 'src/common/dto/pagination.dto';
import { ResourceProtected } from 'src/auth/decorators';
import { VALID_RESOURCES } from 'src/auth/constants';

@Controller('dependencies')
@ResourceProtected(VALID_RESOURCES.dependencies)
export class DependencyController {
  constructor(
    private readonly dependencyService: DependencieService,
    private readonly institutionService: InstitutionService,
  ) {}
  
  @Get('institutions')
  getInstitutions() {
    return this.institutionService.getActiveInstitutions();
  }

  @Get()
  async get(@Query() params: PaginationParamsDto) {
    return await this.dependencyService.findAll(params.limit, params.offset);
  }

  @Get('search/:term')
  async findByText(@Query() params: PaginationParamsDto, @Param('term') text: string) {
    return await this.dependencyService.search(params.limit, params.offset, text);
  }

  @Put('/:id')
  async edit(@Param('id') id: string, @Body() dependency: UpdateDependencyDto) {
    return await this.dependencyService.edit(id, dependency);
  }

  @Post()
  async add(@Body() dependency: CreateDependencyDto) {
    return await this.dependencyService.add(dependency);
  }

  @Delete('/:id')
  async delete(@Param('id') id: string) {
    return await this.dependencyService.delete(id);
  }
}
