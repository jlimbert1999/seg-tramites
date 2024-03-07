import { BadGatewayException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { ExternalDetail, Procedure } from 'src/procedures/schemas';
import { ApplicantAuthenticacion } from './dto/login.dto';

@Injectable()
export class ApplicantService {
  constructor(
    @InjectModel(Procedure.name) private procedureModel: Model<Procedure>,
    @InjectModel(ExternalDetail.name) private externalModel: Model<ExternalDetail>,
    private jwtService: JwtService,
  ) {}
  async login({ dni, code }: ApplicantAuthenticacion) {
    return { token: this.jwtService.sign({ hola: 'ds' }) };
  }
}
