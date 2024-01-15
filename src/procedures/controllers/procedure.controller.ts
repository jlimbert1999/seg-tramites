import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { GetUserRequest } from 'src/auth/decorators';
import {
  CommunicationService,
  ExternalService,
  InternalService,
  ObservationService,
  ProcedureService,
} from '../services';
import { ValidProcedureService, groupProcedure } from '../interfaces';
import { CreateObservationDto, GetProcedureParamsDto } from '../dto';
import { Account } from 'src/users/schemas';

@Controller('procedure')
export class ProcedureController {
  constructor(
    private readonly procedureService: ProcedureService,
    private readonly externalService: ExternalService,
    private readonly internalService: InternalService,
    private readonly communicationService: CommunicationService,
    private readonly observationService: ObservationService,
  ) {}

  @Get('generate')
  async generateNewProcedures() {
    return await this.procedureService.updateAll();
  }
  @Get('observations/generate')
  async generateObservations() {
    return await this.observationService.generateCollection();
  }

  @Get('/:group/:id_procedure')
  async getFullProcedure(@Param() { id_procedure, group }: GetProcedureParamsDto) {
    const procedureService = this.getServiceByGroup(group);
    const [procedure, workflow, observations] = await Promise.all([
      procedureService.getProcedureDetail(id_procedure),
      this.communicationService.getWorkflowOfProcedure(id_procedure),
      this.observationService.getObservationsOfProcedure(id_procedure),
    ]);
    return { procedure, workflow, observations };
  }

  private getServiceByGroup(group: groupProcedure): ValidProcedureService {
    switch (group) {
      case groupProcedure.EXTERNAL:
        return this.externalService;
      default:
        return this.internalService;
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
