import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { RoleService } from '../services';
import { SYSTEM_RESOURCES, VALID_RESOURCES } from 'src/auth/constants';
import { CreateRoleDto } from '../dtos/create-role.dto';
import { ResourceProtected } from 'src/auth/decorators';

@ResourceProtected(VALID_RESOURCES.roles)
@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}
  @Get('resources')
  getResources() {
    return SYSTEM_RESOURCES;
  }

  @Get()
  findAll() {
    return this.roleService.get();
  }
  @Post()
  add(@Body() role: CreateRoleDto) {
    return this.roleService.add(role);
  }

  @Put('/:id')
  async edit(@Param('id') id: string, @Body() role: CreateRoleDto) {
    return await this.roleService.edit(id, role);
  }
}
