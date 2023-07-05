import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ValidResources } from 'src/auth/interfaces/valid-resources.interface';
import { AccountService } from '../services/account.service';
import { DependencieService, InstitutionService } from '../services';

@Controller('accounts')
@Auth(ValidResources.CUENTAS)
export class AccountController {
    constructor(
        private readonly accountService: AccountService,
        private readonly institutionService: InstitutionService,
        private readonly dependencieService: DependencieService,
    ) {

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
}
