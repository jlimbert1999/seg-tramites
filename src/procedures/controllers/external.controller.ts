import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Put, Query } from '@nestjs/common';
import { ExternalService } from '../services/external.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ValidResources } from 'src/auth/interfaces/valid-resources.interface';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { TypeProcedureService } from 'src/administration/services/type-procedure.service';
import { Account } from 'src/administration/schemas';
import { CreateExternalProcedureDto } from '../dto/create-external.dto';
import { UpdateExternalProcedureDto } from '../dto/update-external.dto';
import { OutboxService } from '../services';

@Controller('external')
@Auth(ValidResources.EXTERNOS)
export class ExternalController {
    constructor(
        private readonly externalService: ExternalService,
        private readonly typeProcedure: TypeProcedureService,
        private readonly outboxService: OutboxService
    ) {
    }

    @Get('segments')
    async getSegmentsOfTypesProcedures(
    ) {
        return await this.typeProcedure.getSegmentsOfTypesProcedures()
    }
    @Get('segments/:segment')
    async getTypesProceduresBySegment(
        @Param('segment') segment: string
    ) {
        return await this.typeProcedure.getTypeProceduresBySegments(segment)
    }

    @Get('search/:text')
    async search(
        @GetUser('_id') id_account: string,
        @Query('limit', ParseIntPipe) limit: number, @Query('offset', ParseIntPipe) offset: number,
        @Param('text') text: string
    ) {
        return await this.externalService.search(limit, offset, id_account, text)
    }

    @Patch('send/verify/:id_procedure')
    async verifyIfProcedureisSend(
        @Param('id_procedure') id_procedure: string,
        @GetUser() account: Account
    ) {
        console.log(account);
        const isSend = await this.externalService.verifyIfProcedureIsSend(id_procedure)
    }

    @Patch('send/:id_procedure')
    async markAsSendProcedure(
        @Param('id_procedure') id_procedure: string
    ) {
        await this.externalService.markProcedureAsSend(id_procedure)
        return { ok: true }
    }

    @Get()
    async get(
        @GetUser('_id') id_account: string,
        @Query('limit', ParseIntPipe) limit: number, @Query('offset', ParseIntPipe) offset: number
    ) {
        return await this.externalService.findAll(limit, offset, id_account)
    }

    @Post()
    async add(
        @GetUser() account: Account,
        @Body() procedure: CreateExternalProcedureDto
    ) {
        return await this.externalService.create(procedure, account)
    }

    @Put('/:id_procedure')
    async edit(
        @Param('id_procedure') id_procedure: string,
        @Body() procedure: UpdateExternalProcedureDto
    ) {
        return await this.externalService.update(id_procedure, procedure)
    }


    @Get('/:id_procedure')
    async getOne(
        @Param('id_procedure') id_procedure: string
    ) {
        const { procedure, observations } = await this.externalService.getAllDataProcedure(id_procedure)
        const workflow = await this.outboxService.getWorkflow(id_procedure)
        return {
            procedure,
            observations,
            workflow
        }
    }

}
