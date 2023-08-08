import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ImboxService } from '../services';
import { ValidResources } from 'src/auth/interfaces/valid-resources.interface';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';

@Controller('imbox')
@Auth(ValidResources.ENTRADAS)
export class ImboxController {
    constructor(private readonly imboxService: ImboxService) {

    }
    @Get()
    async get(
        @GetUser('_id') id_account: string,
        @Query('offset', ParseIntPipe) offset: number,
        @Query('limit', ParseIntPipe) limit: number,
    ) {
        return await this.imboxService.getAll(id_account, limit, offset)
    }
}
