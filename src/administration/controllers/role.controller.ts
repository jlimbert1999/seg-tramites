import { Controller, Get, ParseIntPipe, Query } from '@nestjs/common';
import { RoleService } from '../services';

@Controller('roles')
export class RoleController {
    constructor(
        private readonly roleService: RoleService
    ) {

    }

    @Get()
    async get(@Query('limit', ParseIntPipe) limit: number, @Query('offset', ParseIntPipe) offset: number) {
        return await this.roleService.get(limit, offset)
    }

}
