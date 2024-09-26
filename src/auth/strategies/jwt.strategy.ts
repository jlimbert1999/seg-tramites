import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Model } from 'mongoose';

import { EnvConfig, JwtPayload } from '../interfaces';
import { User } from 'src/modules/users/schemas';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService<EnvConfig>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow('jwt_key'),
    });
  }
  async validate(payload: JwtPayload): Promise<User> {
    const user = await this.userModel
      .findById(payload.userId)
      .select('-password')
      .populate('role');
    if (!user) throw new UnauthorizedException();
    return user;
  }
}
