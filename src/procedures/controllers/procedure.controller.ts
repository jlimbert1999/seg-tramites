import { BadRequestException, Controller, Get, Param } from '@nestjs/common';
import { Auth } from 'src/auth/decorators/auth.decorator';
import {
  CommunicationService,
  ExternalService,
  InternalService,
  ObservationService,
  ProcedureService,
} from '../services';
import { groupProcedure } from '../interfaces';

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

  @Get()
  async get() {
    return await this.procedureService.updateAll();
  }

  @Get('/:group/:id_procedure')
  async getFullProcedure(@Param('id_procedure') id_procedure: string, @Param('group') group: groupProcedure) {
    const procedureService = this.getServiceByGroup(group);
    const [procedure, workflow, observations] = await Promise.all([
      procedureService.getProcedureDetail(id_procedure),
      this.communicationService.getWorkflowOfProcedure(id_procedure),
      this.observationService.getObservationsOfProcedure(id_procedure),
    ]);
    return { procedure, workflow, observations };
  }

  private getServiceByGroup(group: groupProcedure) {
    switch (group) {
      case groupProcedure.EXTERNAL:
        return this.externalService;
      case groupProcedure.INTERNAL:
        return this.internalService;
      default:
        throw new BadRequestException('Tipo de tramite no definido');
    }
  }
}
