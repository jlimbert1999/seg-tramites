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
    // const detail = await this.externalModel.findOne({ 'solicitante.dni': dni });
    // if (!detail) throw new BadGatewayException('El tramite no existe');
    // const procedure = await this.procedureModel.findOne({ details: detail._id, code: code });
    // if (!procedure) throw new BadGatewayException('El tramite no existe');
    // const payload = { dni: dni, code: code };
    // return {
    //   toke: await this.jwtService.signAsync(payload),
    // };
    return { token: this.jwtService.sign({ hola: 'ds' }) };
  }
}
