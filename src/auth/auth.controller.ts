import { Controller, Post, Body, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { GetUser } from './decorators/get-user.decorator';
import { Account } from 'src/administration/schemas/account.schema';
import { Auth } from './decorators/auth.decorator';
import { ValidResources } from './interfaces/valid-resources.interface';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService
  ) { }

  @Post()
  async login(@Body() body: AuthDto) {
    return await this.authService.loginUser(body)
  }

  @Get()
  @Auth(ValidResources.CUENTAS)
  async verifyAuth(@GetUser() account: Account) {
    return await this.authService.checkAuthStatus(account._id)
  }
}
