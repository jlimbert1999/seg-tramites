import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { Auth, GetUserRequest, Permission } from 'src/auth/decorators';
import {
  CommunicationService,
  ExternalService,
  InternalService,
  ObservationService,
  ProcedureService,
} from '../services';
import { ValidProcedureService, groupProcedure } from '../interfaces';
import { CreateObservationDto, GetProcedureParamsDto } from '../dto';
import { validResources } from 'src/auth/interfaces/valid-resources.interface';
import { Account } from 'src/auth/schemas/account.schema';

@Controller('procedure')
@Auth()
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
  @Permission({ resource: validResources.communication })
  async getFullProcedure(@Param() procedureParamsDto: GetProcedureParamsDto) {
    const { id_procedure, group } = procedureParamsDto;
    const procedureService = this.getServiceByGroup(group);
    const [procedure, workflow, observations] = await Promise.all([
      procedureService.getProcedureDetail(id_procedure),
      this.communicationService.getWorkflowOfProcedure(id_procedure),
      this.observationService.getObservationsOfProcedure(id_procedure),
    ]);
    return { procedure, workflow, observations };
  }

  @Post('/:id_procedure/observation')
  @Permission({ resource: validResources.communication })
  addObservation(
    @GetUserRequest() account: Account,
    @Param('id_procedure') id_procedure: string,
    @Body() observationDto: CreateObservationDto,
  ) {
    this.observationService.add(id_procedure, account, observationDto);
  }

  @Put('observation/:id_observation')
  @Permission({ resource: validResources.communication })
  solveObservation(@Param('id_observation') id_observation: string) {
    this.observationService.solveObservation(id_observation);
  }

  private getServiceByGroup(group: groupProcedure): ValidProcedureService {
    switch (group) {
      case groupProcedure.EXTERNAL:
        return this.externalService;
      default:
        return this.internalService;
    }
  }
}
