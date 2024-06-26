import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { AccountService } from '../services';
import { CreateAccountDto, GetAccountsDto, UpdateAccountDto } from '../../users/dtos';
import { DependencieService, InstitutionService, JobService } from 'src/administration/services';
import { RoleService } from '../../users/services';
import { FilterAccountsDto } from '../dtos/params/filter-accounts.dto';
import { ResourceProtected } from 'src/auth/decorators';
import { VALID_RESOURCES } from 'src/auth/constants';
import { IsMongoidPipe } from 'src/common/pipes';
import { CreateOfficerDto } from 'src/administration/dtos';

@ResourceProtected(VALID_RESOURCES.accounts)
@Controller('accounts')
export class AccountController {
  constructor(
    private readonly accountService: AccountService,
    private readonly institutionService: InstitutionService,
    private readonly dependencieService: DependencieService,
    private readonly roleService: RoleService,
    private readonly jobService: JobService,
  ) {}

  @Get('roles')
  getRoles() {
    return this.roleService.getActiveRoles();
  }

  @Get('institutions')
  getInstitutions() {
    return this.institutionService.getActiveInstitutions();
  }

  @Get('jobs/:text')
  async getJob(@Param('text') text: string) {
    return await this.jobService.searchJobForUser(text);
  }

  @Get('dependencie/:id_institucion')
  async getDependencies(@Param('id_institucion', IsMongoidPipe) id_institucion: string, @Query('text') text: string) {
    return await this.dependencieService.getActiveDependenciesOfInstitution(id_institucion, text);
  }

  @Get('assign/:text')
  searchOfficersWithoutAccount(@Param('text') text: string) {
    return this.accountService.searchOfficersWithoutAccount(text);
  }

  @Get('search/:term')
  search(@Param('term') term: string, @Query() params: GetAccountsDto) {
    return this.accountService.search(term, params);
  }

  @Get()
  findAll(@Query() params: GetAccountsDto) {
    return this.accountService.findAll(params);
  }

  @Post()
  create(@Body('officer') officer: CreateOfficerDto, @Body('account') account: CreateAccountDto) {
    return this.accountService.create(account, officer);
  }

  @Post('assign')
  assign(@Body() account: CreateAccountDto) {
    return this.accountService.assign(account);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() account: UpdateAccountDto) {
    return this.accountService.update(id, account);
  }

  @Delete('unlink/:id')
  unlink(@Param('id') id: string) {
    return this.accountService.unlink(id);
  }

  @Delete(':id')
  disable(@Param('id') id: string) {
    return this.accountService.disable(id);
  }

  @Put('visibility/:id')
  toggleVisibility(@Param('id') id: string) {
    return this.accountService.toggleVisibility(id);
  }
}
