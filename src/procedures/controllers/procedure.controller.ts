import { Body, Controller, Get, InternalServerErrorException, Param, Post, Put } from '@nestjs/common';
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

  @Get('/:group/:id')
  async getFullProcedure(@Param() params: GetProcedureParamsDto) {
    const procedureService = this.getServiceByGroup(params.group);
    const [procedure, workflow, observations] = await Promise.all([
      procedureService.getDetail(params.id),
      this.communicationService.getWorkflowOfProcedure(params.id),
      this.observationService.getObservationsOfProcedure(params.id),
    ]);
    return { procedure, workflow, observations };
  }

  private getServiceByGroup(group: groupProcedure): ValidProcedureService {
    switch (group) {
      case groupProcedure.EXTERNAL:
        return this.externalService;
      case groupProcedure.INTERNAL:
        return this.internalService;
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
