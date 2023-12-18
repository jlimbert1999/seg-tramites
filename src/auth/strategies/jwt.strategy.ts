import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { Account } from '../schemas/account.schema';
import { EnvConfig, JwtPayload } from '../interfaces';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService<EnvConfig>,
    @InjectModel(Account.name) private accountModel: Model<Account>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.getOrThrow('jwt_key'),
    });
  }
  async validate(payload: JwtPayload): Promise<Account> {
    const { id_account } = payload;
    const account = await this.accountModel.findById(id_account).select('-password').populate('rol');
    if (!account) throw new UnauthorizedException('Token invalido, vuelva a iniciar sesion');
    if (account.rol.permissions.length === 0)
      throw new UnauthorizedException('Esta cuenta no tiene ningun permiso asignado');
    if (String(account._id) === this.configService.get('id_root')) return account;
    if (!account.activo || !account.funcionario) throw new UnauthorizedException('Esta cuenta ha sido deshablitada');
    return account;
  }
}
