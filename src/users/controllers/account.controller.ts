import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { AccountService } from '../services/account.service';
import { JobService } from '../services/job.service';
import { CreateAccountDto, CreateOfficerDto, GetAccountsDto, UpdateAccountDto } from '../../users/dtos';
import { DependencieService, InstitutionService } from 'src/administration/services';
import { RoleService } from '../../users/services';
import { FilterAccountsDto } from '../dtos/params/filter-accounts.dto';
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
  async getRoles() {
    return await this.roleService.getRoles();
  }
  @Get('jobs/:text')
  async getJob(@Param('text') text: string) {
    return await this.jobService.searchJobForUser(text);
  }
  @Get('institutions')
  async getInstitutions(@Query() params: { text?: string; limit?: number }) {
    return await this.institutionService.searchActiveInstitutions(params.text, params.limit);
  }
  @Get('dependencie/:id_institucion')
  async getDependencies(@Param('id_institucion') id_institucion: string, @Query('text') text: string) {
    return await this.dependencieService.getActiveDependenciesOfInstitution(id_institucion, text);
  }
  @Get('officers/assign/:text')
  async searchOfficersForAssign(@Param('text') text: string) {
    return await this.accountService.findOfficersForAssign(text);
  }
  @Get('search')
  async search(@Query() params: FilterAccountsDto) {
    return await this.accountService.search(params);
  }

  @Get()
  async findAll(@Query() params: GetAccountsDto) {
    return await this.accountService.findAll(params);
  }

  @Post()
  create(@Body('officer') officer: CreateOfficerDto, @Body('account') account: CreateAccountDto) {
    return this.accountService.create(account, officer);
  }

  @Put('/:id_account')
  async update(@Param('id_account') id_account: string, @Body() account: UpdateAccountDto) {
    return await this.accountService.update(id_account, account);
  }

  @Post('assign')
  async createAccountWithAssignment(@Body() account: CreateAccountDto) {
    return await this.accountService.createAccountWithAssignment(account);
  }
  @Delete('unlink/:id')
  async unlinkAccount(@Param('id') id: string) {
    return await this.accountService.unlinkAccount(id);
  }

  @Put('assign/:id_account')
  async assignAccountOfficer(@Param('id_account') id_account: string, @Body('id_officer') id_officer: string) {
    return await this.accountService.assingAccountOfficer(id_account, id_officer);
  }

  @Put('visibility/:id')
  toggleVisibility(@Param('id') id: string) {
    return this.accountService.toggleVisibility(id);
  }
}
