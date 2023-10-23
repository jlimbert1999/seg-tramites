import { Controller, Get, Param } from '@nestjs/common';
import { Auth } from 'src/auth/decorators/auth.decorator';
import {
  CommunicationService,
  ObservationService,
  ArchiveService,
  ProcedureService,
} from '../services';

@Controller('procedure')
@Auth()
export class ProcedureController {
  constructor(
    private readonly procedureService: ProcedureService,
    private readonly communicationService: CommunicationService,
    private readonly observationService: ObservationService,
    private readonly archiveService: ArchiveService,
  ) {}

  @Get()
  async get() {
    return await this.procedureService.updateAll();
  }

  @Get('/:id')
  async getFullProcedure(@Param('id') id_procedure: string) {
    const [procedure, workflow, observations] = await Promise.all([
      this.procedureService.getProcedure(id_procedure),
      this.communicationService.getWorkflowOfProcedure(id_procedure),
      this.observationService.getObservationsOfProcedure(id_procedure),
    ]);
    return { procedure, workflow, observations };
  }
}
