import { Controller, Post, Body, Get, Param, Put } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { Auth, GetUserRequest } from './decorators';
import { UpdateMyAccountDto } from './dto/my-account.dto';
import { Account } from './schemas/account.schema';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  async login(@Body() body: AuthDto) {
    return await this.authService.loginUser(body);
  }

  @Get('/:id_account')
  @Auth()
  async getMyAuthDetails(@Param('id_account') id_account: string) {
    return await this.authService.getMyAuthDetails(id_account);
  }

  @Put('/:id_account')
  @Auth()
  async updateMyAccount(@Param('id_account') id_account: string, @Body() data: UpdateMyAccountDto) {
    return await this.authService.updateMyAccount(id_account, data);
  }

  @Get()
  @Auth()
  async verifyAuth(@GetUserRequest() account: Account) {
    return await this.authService.checkAuthStatus(account._id);
  }
}
