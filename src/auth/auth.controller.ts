import { Controller, Get, Post, Body, Patch, Param, Delete, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AccountService } from 'src/administration/services/account.service';
import * as bcrypt from 'bcrypt';
import { AuthDto } from './dto/auth.dto';
import { JwtService } from '@nestjs/jwt';
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly accountService: AccountService,
    private jwtService: JwtService
  ) { }



  @Post()
  async login(@Body() body: AuthDto) {
    const account = await this.accountService.findByLogin(body.login)
    if (!account) throw new BadRequestException('login o password incorrectos')
    if (!bcrypt.compareSync(body.password, account.password)) throw new BadRequestException('login o password incorrectos')
    console.log(account.rol._id);
    account.rol

    this.accountService.findByLogin(account.rol.toString())

    if (account._id === '6431d0ba6bdf1decc47cbab0') {

      // const payload = {
      //   id_account: account._id,
      //   officer: {
      //     fullname: 'ADMINISTRADOR',
      //     jobtitle: 'CONFIGURACIONES'
      //   }
      // };
      // return {
      //   token: jwtHelper.createRootToken(account),
      //   resources: account.rol.privileges.map(privilege => privilege.resource)
      // }
    }

  }
}
