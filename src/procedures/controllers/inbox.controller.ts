import { Body, Controller, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { ValidResources } from 'src/auth/interfaces/valid-resources.interface';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { DependencieService, InstitutionService } from 'src/administration/services';
import { InboxService } from '../services';
import { Account } from 'src/administration/schemas';
import { ImboxDto } from '../dto/create-inbox.dto';

@Controller('inbox')
@Auth(ValidResources.ENTRADAS)
export class InboxController {
    constructor(
        private readonly inboxService: InboxService,
        private readonly institutionService: InstitutionService,
        private readonly dependencieService: DependencieService,
    ) {

    }

    @Get('institutions')
    async getInstitutions(
    ) {
        return await this.institutionService.getActiveInstitutions()
    }

    @Get('dependencies/:id_institution')
    async getDependencies(
        @Param('id_institution') id_institution: string
    ) {
        return await this.dependencieService.getActiveDependenciesOfInstitution(id_institution)
    }
    @Get('accounts/:id_dependency')
    async getAcccount(
        @Param('id_dependency') id_dependency: string
    ) {
        return await this.inboxService.getAccountForSend(id_dependency)
    }

    @Get()
    async get(
        @GetUser('_id') id_account: string,
        @Query('offset', ParseIntPipe) offset: number,
        @Query('limit', ParseIntPipe) limit: number,
    ) {
        return await this.inboxService.getAll(id_account, limit, offset)
    }

    @Post()
    async add(
        @GetUser() account: Account,
        @Body() inbox: ImboxDto
    ) {
        return await this.externalService.create(procedure, account)
    }
}
