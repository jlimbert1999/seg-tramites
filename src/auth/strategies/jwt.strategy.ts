import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Model } from 'mongoose';

import { EnvConfig, JwtPayload } from '../interfaces';
import { Account } from 'src/users/schemas';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService<EnvConfig>,
    @InjectModel(Account.name) private accountModel: Model<Account>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow('jwt_key'),
    });
  }
  async validate(payload: JwtPayload): Promise<Account> {
    const { id_account } = payload;
    const account = await this.accountModel.findById(id_account).select('-password').populate('rol');
    if (!account) throw new UnauthorizedException('Token invalido, vuelva a iniciar sesion');
    if (account.rol.permissions.length === 0) {
      throw new UnauthorizedException('La cuenta no tiene ningun permiso asignado');
    }
    if (String(account._id) === this.configService.get('id_root')) return account;
    if (!account.activo || !account.funcionario) throw new UnauthorizedException('La cuenta ha sido deshablitada');
  
    return account;
  }
}
