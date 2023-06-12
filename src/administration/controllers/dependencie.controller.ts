import { Controller, Get } from '@nestjs/common';
import { DependencieService } from '../services/dependencie.service';

@Controller('dependencie')
export class DependencieController {
    constructor(
        private readonly dependencyService: DependencieService
    ) {

    }
    @Get()
    async myroute() {
        await this.dependencyService.update()
    }
}
