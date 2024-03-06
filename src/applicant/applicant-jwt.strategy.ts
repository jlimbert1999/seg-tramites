import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtApplicantStrategy extends PassportStrategy(Strategy, 'jwtapplicants') {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow('jwt_public_key'),
    });
  }

  async validate(payload: any) {
    console.log('paso');
    // Aquí puedes realizar cualquier validación adicional del token para los postulantes
    return { id: 'ds' };
  }
}
