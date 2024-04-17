import { Body, Controller, Get, InternalServerErrorException, Param, Post, Put } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

import { GetUserRequest } from 'src/auth/decorators';
import { CommunicationService, ObservationService, ExternalService, InternalService } from '../services';
import { ValidProcedureService, groupProcedure } from '../interfaces';
import { CreateObservationDto, GetProcedureParamsDto } from '../dto';
import { Account } from 'src/users/schemas';
import { IsMongoidPipe } from 'src/common/pipes';

@Controller('procedure')
export class ProcedureController {
  constructor(
    private communicationService: CommunicationService,
    private observationService: ObservationService,
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

  @Get('location/:id')
  async getLocation(@Param('id', IsMongoidPipe) id_procedure: string) {
    return this.communicationService.getLocation(id_procedure);
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

  @Post('observation/:id_procedure')
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

  @Get('observations/:id')
  getObservations(@Param('id', IsMongoidPipe) id_procedure: string) {
    return this.observationService.getObservations(id_procedure);
  }
}
