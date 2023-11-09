import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../interfaces/jwt.interface';
import { Account } from '../schemas/account.schema';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(@InjectModel(Account.name) private readonly accountModel: Model<Account>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'secret',
    });
  }
  async validate(payload: JwtPayload): Promise<Account> {
    const { id_account } = payload;
    const account = await this.accountModel.findById(id_account).select('-password').populate('rol');
    if (!account) throw new UnauthorizedException('Token invalido, vuelva a iniciar sesion');
    if (account.rol.permissions.length === 0)
      throw new UnauthorizedException('Esta cuenta no tiene ningun permiso asignado');
    if (account._id == '639dde6d495c82b3794d6606') return account;
    if (!account.activo || !account.funcionario) throw new UnauthorizedException('Esta cuenta ha sido deshablitada');
    return account;
  }
}
