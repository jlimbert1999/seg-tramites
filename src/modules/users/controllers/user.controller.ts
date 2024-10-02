import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { Public, ResourceProtected } from 'src/auth/decorators';
import { SystemResource } from 'src/auth/constants';
import { PaginationDto } from 'src/common';


import { RoleService, UserService } from '../services';
import { CreateUserDto, UpdateUserDto } from '../dtos';

@Controller('user')
@ResourceProtected(SystemResource.USERS)
export class UserController {
  constructor(
    private userService: UserService,
    private roleService: RoleService,
  ) {}

  @Get()
  findAll(@Query() params: PaginationDto) {
    return this.userService.findAll(params);
  }

  @Post()
  create(@Body() userDto: CreateUserDto) {
    return this.userService.create(userDto);
  }

  @Patch(':id')
  update(@Param('id') userId: string, @Body() job: UpdateUserDto) {
    return this.userService.update(userId, job);
  }

  @Get('roles')
  getRoles() {
    return this.roleService.getActiveRoles();
  }
}
