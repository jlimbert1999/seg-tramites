import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { RoleService } from '../services';
import { CreateRoleDto } from '../dto/create-role.dto';
import { systemModules } from '../helpers/system-modules';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { validResources } from 'src/auth/interfaces/valid-resources.interface';

@Auth(validResources.roles)
@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  async get(
    @Query('limit', ParseIntPipe) limit: number,
    @Query('offset', ParseIntPipe) offset: number,
  ) {
    return await this.roleService.get(limit, offset);
  }

  @Get('resources')
  getResources() {
    const modules = systemModules.map((el) => {
      const resources = el.resources.map((item) => {
        const { value, text, actions } = item;
        return { value, text, actions, disabled: false };
      });
      return { group: el.group, resources: resources };
    });
    return modules;
  }

  @Post()
  async add(@Body() role: CreateRoleDto) {
    return await this.roleService.add(role);
  }

  @Put('/:id')
  async edit(@Param('id') id: string, @Body() role: CreateRoleDto) {
    return await this.roleService.edit(id, role);
  }
}
