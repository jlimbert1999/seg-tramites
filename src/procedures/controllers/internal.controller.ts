import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Put, Query } from '@nestjs/common';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { ValidResources } from 'src/auth/interfaces/valid-resources.interface';
import { InternalService, OutboxService } from '../services';
import { OfficerService, TypeProcedureService } from 'src/administration/services';
import { Account } from 'src/administration/schemas';
import { CreateInternalProcedureDto } from '../dto/create-internal.dto';
import { UpdateInternalProcedureDto } from '../dto/update-internal.dto';

@Controller('internal')
@Auth(ValidResources.INTERNOS)
export class InternalController {
    constructor(
        private readonly internalService: InternalService,
        private readonly officerService: OfficerService,
        private readonly typeProcedureService: TypeProcedureService,
        private readonly outboxService: OutboxService
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

    @Patch('send/:id_procedure')
    async markAsSendProcedure(
        @Param('id_procedure') id_procedure: string
    ) {
        await this.internalService.markProcedureAsSend(id_procedure)
        return { ok: true }
    }

    @Get('search/:text')
    async search(
        @GetUser('_id') id_account: string,
        @Param('text') text: string,
        @Query('limit', ParseIntPipe) limit: number, @Query('offset', ParseIntPipe) offset: number
    ) {
        return await this.internalService.search(limit, offset, id_account, text)
    }

    @Get('/:id_procedure')
    async getOne(
        @Param('id_procedure') id_procedure: string
    ) {
        const { procedure, observations } = await this.internalService.getAllDataProcedure(id_procedure)
        const workflow = await this.outboxService.getWorkflow(id_procedure)
        return {
            procedure,
            observations,
            workflow
        }
    }

    @Get()
    async get(
        @GetUser('_id') id_account: string,
        @Query('limit', ParseIntPipe) limit: number, @Query('offset', ParseIntPipe) offset: number
    ) {
        return await this.internalService.findAll(limit, offset, id_account)
    }

    @Post()
    async add(
        @GetUser() account: Account,
        @Body() procedure: CreateInternalProcedureDto
    ) {
        return await this.internalService.add(procedure, account)
    }

    @Put('/:id_procedure')
    async edit(
        @Param('id_procedure') id_procedure: string,
        @Body() procedure: UpdateInternalProcedureDto
    ) {
        return await this.internalService.update(id_procedure, procedure)
    }




}
