import { Body, Controller, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ValidResources } from 'src/auth/interfaces/valid-resources.interface';
import { AccountService } from '../services/account.service';
import { DependencieService, InstitutionService, RoleService } from '../services';
import { JobService } from '../services/job.service';
import { CreateOfficerDto } from '../dto/create-officer.dto';
import { CreateAccountDto } from '../dto/create-account.dto';

@Controller('accounts')
@Auth(ValidResources.CUENTAS)
export class AccountController {
    constructor(
        private readonly accountService: AccountService,
        private readonly institutionService: InstitutionService,
        private readonly dependencieService: DependencieService,
        private readonly roleService: RoleService,
        private readonly jobService: JobService,

    ) {

    }
    @Get('roles')
    async getRoles() {
        return await this.roleService.getActiveRoles()
    }
    @Get('jobs/:text')
    async getJob(
        @Param('text') text: string
    ) {
        return await this.jobService.searchJobForUser(text)
    }
    @Get('institutions')
    async getInstitutions() {
        return await this.institutionService.getActiveInstitutions()
    }
    @Get('institution-dependencie/:id')
    async getDependencies(
        @Param('id') id_institucion: string
    ) {
        return await this.dependencieService.getActiveDependenciesOfInstitution(id_institucion)
    }
    @Get('officers/assign/:text')
    async searchOfficersForAssign(@Param('text') text: string) {
        return await this.accountService.findOfficersForAssign(text)
    }
    @Get('search')
    async search(
        @Query('institution') id_institucion: string,
        @Query('dependency') id_dependency: string,
        @Query('text') text: string,
        @Query('limit', ParseIntPipe) limit: number,
        @Query('offset', ParseIntPipe) offset: number

    ) {
        return await this.accountService.search(limit, offset, text, id_institucion, id_dependency)
    }

    @Get()
    async findAll(@Query('limit', ParseIntPipe) limit: number, @Query('offset', ParseIntPipe) offset: number) {
        return await this.accountService.findAll(limit, offset)
    }
    @Post()
    async create(
        @Body('officer') officer: CreateOfficerDto,
        @Body('account') account: CreateAccountDto
    ) {
        return await this.accountService.createAccountWithOfficer(officer, account)
    }

    @Post('assign')
    async createAccountWithAssignment(
        @Body() account: CreateAccountDto
    ) {
        return await this.accountService.createAccountWithAssignment(account)
    }
}
