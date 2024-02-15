import { Body, Controller, Get, InternalServerErrorException, Param, Post, Put } from '@nestjs/common';
import { GetUserRequest } from 'src/auth/decorators';
import { CommunicationService, ObservationService } from '../services';
import { ValidProcedureService, groupProcedure } from '../interfaces';
import { CreateObservationDto, GetProcedureParamsDto } from '../dto';
import { Account } from 'src/users/schemas';
import { IsMongoidPipe } from 'src/common/pipes';
import { ExternalService, InternalService } from '../services';
import { ModuleRef } from '@nestjs/core';

@Controller('procedure')
export class ProcedureController {
  constructor(
    // private readonly externalService: ExternalService,
    // private readonly internalService: InternalService,
    private readonly communicationService: CommunicationService,
    private readonly observationService: ObservationService,
    private moduleRef: ModuleRef,
  ) {}

  @Get('workflow/:id')
  getWorkflow(@Param('id', IsMongoidPipe) id_procedure: string) {
    return this.communicationService.getWorkflow(id_procedure);
  }

  @Get('detail/:group/:id')
  async getDetail(@Param() params: GetProcedureParamsDto) {
    return await this.getServiceByGroup(params.group).getDetail(params.id);
  }
  @Get('/:group/:id')
  async getFullProcedure(@Param() params: GetProcedureParamsDto) {
    const procedureService = this.getServiceByGroup(params.group);
    const [procedure, workflow, observations] = await Promise.all([
      procedureService.getDetail(params.id),
      this.communicationService.getWorkflow(params.id),
      this.observationService.getObservationsOfProcedure(params.id),
    ]);
    return { procedure, workflow, observations };
  }

  private getServiceByGroup(group: groupProcedure): ValidProcedureService {
    switch (group) {
      case groupProcedure.EXTERNAL:
        return this.moduleRef.get(ExternalService);
      case groupProcedure.INTERNAL:
        return this.moduleRef.get(InternalService);
      default:
        throw new InternalServerErrorException('Group procedure is not defined');
    }
  }

  @Post('/:id_procedure/observation')
  addObservation(
    @GetUserRequest() account: Account,
    @Param('id_procedure') id_procedure: string,
    @Body() observationDto: CreateObservationDto,
  ) {
    return this.observationService.add(id_procedure, account, observationDto);
  }

  @Put('observation/:id_observation')
  solveObservation(@Param('id_observation') id_observation: string) {
    return this.observationService.solveObservation(id_observation);
  }
}
