import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { RoleService } from '../services';
import { CreateRoleDto } from '../dto/create-role.dto';

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

    @Post()
    async add(@Body() role: CreateRoleDto) {
        return await this.roleService.add(role)
    }

    @Put('/:id')
    async edit(
        @Param('id') id: string,
        @Body() role: CreateRoleDto) {
        return await this.roleService.edit(id, role)
    }

}
