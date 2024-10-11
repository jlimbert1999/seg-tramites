import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { RoleService } from '../../users/services';
import {
  AccountService,
  DependencieService,
  InstitutionService,
  OfficerService,
} from 'src/modules/administration/services';
import { Public, ResourceProtected } from 'src/auth/decorators';
import { PROCEDURES, SystemResource } from 'src/auth/constants';
import { IsMongoidPipe } from 'src/common/pipes';
import {
  CreateAccountDto,
  FilterAccountDto,
  UpdateAccountDto,
} from 'src/modules/administration/dtos';
import { CreateUserDto, UpdateUserDto } from 'src/modules/users/dtos';

// @ResourceProtected(SystemResource.accounts)
@Controller('accounts')
export class AccountController {
  constructor(
    private readonly accountService: AccountService,
    private readonly institutionService: InstitutionService,
    private readonly dependencieService: DependencieService,
    private readonly officerService: OfficerService,
    private readonly roleService: RoleService,
  ) {}

  @Get('repair')
  @Public()
  repair() {
    return this.accountService.repairColection();
  }

  @Get()
  @Public()
  findAll(@Query() params: FilterAccountDto) {
    return this.accountService.findAll(params);
  }

  @Post()
  create(
    @Body('account') account: CreateAccountDto,
    @Body('user') user: CreateUserDto,
  ) {
    return this.accountService.create(user, account);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body('user') user: UpdateUserDto,
    @Body('account') account: UpdateAccountDto,
  ) {
    return this.accountService.update(id, user, account);
  }

  @Delete('unlink/:id')
  unlink(@Param('id') id: string) {
    return this.accountService.unlink(id);
  }

  @Delete(':id')
  disable(@Param('id') id: string) {
    // return this.accountService.disable(id);
  }

  @Put('visibility/:id')
  toggleVisibility(@Param('id') id: string) {
    // return this.accountService.toggleVisibility(id);
  }

  @Get('institutions')
  getInstitutions() {
    return this.institutionService.getActiveInstitutions();
  }

  @Get('dependencies/:institutionId')
  getDependencies(
    @Param('institutionId', IsMongoidPipe) institutionId: string,
  ) {
    return this.dependencieService.getActiveDependenciesOfInstitution(
      institutionId,
    );
  }

  @Get('assign')
  searchOfficersWithoutAccount(@Query('term') text: string) {
    return this.officerService.searchOfficersWithoutAccount(text);
  }

  @Get('roles')
  getRoles() {
    return this.roleService.getActiveRoles();
  }
}
