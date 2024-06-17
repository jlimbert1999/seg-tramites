import { Controller, Post, Body, Get, Put } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto, UpdateMyAccountDto } from './dto';
import { GetUserRequest, Public } from './decorators';
import { Account } from 'src/users/schemas';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post()
  @Public()
  login(@Body() body: AuthDto) {
    return this.authService.login(body);
  }

  @Get()
  checkAuthStatus(@GetUserRequest() account: Account) {
    return this.authService.checkAuthStatus(account._id);
  }

  @Get('detail')
  getAuthDetails(@GetUserRequest('_id') id: string) {
    return this.authService.getMyAuthDetails(id);
  }

  @Put()
  updateMyAccount(@GetUserRequest('_id') id: string, @Body() data: UpdateMyAccountDto) {
    return this.authService.updateMyAccount(id, data);
  }
}
