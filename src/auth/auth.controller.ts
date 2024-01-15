import { Controller, Post, Body, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { GetUserRequest } from './decorators';
import { Account } from 'src/users/schemas';
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  @Public()
  login(@Body() body: AuthDto) {
    return this.authService.login(body);
  }

  @Get()
  async checkAuthStatus(@GetUserRequest() account: Account) {
    return await this.authService.checkAuthStatus(account._id);
  }
}
