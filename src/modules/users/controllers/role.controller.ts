import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { SYSTEM_RESOURCES, VALID_RESOURCES } from 'src/auth/constants';
import { RoleService } from '../services';

import { ResourceProtected } from 'src/auth/decorators';
import { CreateRoleDto, FilterRoleDto, UpdateRoleDto } from '../dtos';

@ResourceProtected(VALID_RESOURCES.roles)
@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}
  @Get('resources')
  getResources() {
    return SYSTEM_RESOURCES;
  }

  @Get()
  findAll(@Query() filterParams: FilterRoleDto) {
    return this.roleService.findAll(filterParams);
  }

  @Post()
  add(@Body() role: CreateRoleDto) {
    return this.roleService.add(role);
  }

  @Patch(':id')
  async edit(@Param('id') id: string, @Body() role: UpdateRoleDto) {
    return await this.roleService.edit(id, role);
  }
}
