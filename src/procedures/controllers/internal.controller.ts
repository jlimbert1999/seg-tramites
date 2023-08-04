import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { ValidResources } from 'src/auth/interfaces/valid-resources.interface';
import { InternalService } from '../services';
import { OfficerService, TypeProcedureService } from 'src/administration/services';

@Controller('internal')
@Auth(ValidResources.INTERNOS)
export class InternalController {
    constructor(
        private readonly internalService: InternalService,
        private readonly officerService: OfficerService,
        private readonly typeProcedureService: TypeProcedureService,

    ) {
    }
    @Get('/types-procedures')
    async getTypesProcedures() {
        return await this.typeProcedureService.getTypesProceduresByGroup('INTERNO')
    }
    @Get('/participant/:text')
    async findParticipantForProcess(
        @Param('text') text: string
    ) {
        return await this.officerService.findOfficerForProcess(text)
    }

    @Get()
    async get(
        @GetUser('_id') id_account: string,
        @Query('limit', ParseIntPipe) limit: number, @Query('offset', ParseIntPipe) offset: number
    ) {
        return await this.internalService.findAll(limit, offset, id_account)
    }

    @Get('search')
    async search(
        @GetUser('_id') id_account: string,
        @Query('limit', ParseIntPipe) limit: number, @Query('offset', ParseIntPipe) offset: number
    ) {

        return await this.internalService.findAll(limit, offset, id_account)
    }

   


}
