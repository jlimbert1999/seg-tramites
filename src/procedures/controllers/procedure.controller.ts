import { Controller, Get } from '@nestjs/common';
import { ProcedureService } from '../services/procedure.service';

@Controller('procedure')
export class ProcedureController {
    constructor(
        private readonly procedureService: ProcedureService
    ) {
    }

    @Get()
    async get(
    ) {
        return await this.procedureService.updateAll()
    }


}
