import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ApplicantService } from './applicant.service';
import { ApplicantController } from './applicant.controller';
import { ProceduresModule } from 'src/procedures/procedures.module';
import { PassportModule } from '@nestjs/passport';
import { JwtApplicantStrategy } from './applicant-jwt.strategy';

@Module({
  imports: [
    ProceduresModule,
    PassportModule.register({ defaultStrategy: 'jwtapplicants' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow('jwt_public_key'),
        signOptions: { expiresIn: '1h' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [ApplicantController],

  providers: [JwtApplicantStrategy, ApplicantService],
})
export class ApplicantModule {}
