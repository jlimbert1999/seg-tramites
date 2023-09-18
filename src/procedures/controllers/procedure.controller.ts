import { Controller, Get, Param } from '@nestjs/common';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ProcedureService } from '../services/procedure.service';
import { InboxService, OutboxService } from '../services';

@Controller('procedure')
@Auth()
export class ProcedureController {
  constructor(
    private readonly procedureService: ProcedureService,
    private readonly inboxService: InboxService,
    private readonly outboxService: OutboxService,
  ) {}

  @Get()
  async get() {
    return await this.procedureService.updateAll();
  }

  @Get('/:id')
  async getFullProcedure(@Param('id') id_procedure: string) {
    const [procedure, location, workflow] = await Promise.all([
      this.procedureService.getProcedure(id_procedure),
      this.inboxService.getLocationProcedure(id_procedure),
      this.outboxService.getWorkflowProcedure(id_procedure),
    ]);
    return { procedure, location, workflow };
  }
}
