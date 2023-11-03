import { Controller, Get, Param } from '@nestjs/common';
import { Auth } from 'src/auth/decorators/auth.decorator';
import {
  CommunicationService,
  ExternalService,
  InternalService,
  ObservationService,
  ProcedureService,
} from '../services';
import { ValidProcedureService, groupProcedure } from '../interfaces';
import { GetProcedureParamsDto } from '../dto';

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

  private getServiceByGroup(group: groupProcedure): ValidProcedureService {
    switch (group) {
      case groupProcedure.EXTERNAL:
        return this.externalService;
      default:
        return this.internalService;
    }
  }
}
