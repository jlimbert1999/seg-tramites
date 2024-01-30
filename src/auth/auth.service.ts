import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';

import { AuthDto, UpdateMyAccountDto } from './dto';
import { EnvConfig, JwtPayload } from './interfaces';
import { Account, Role } from 'src/users/schemas';
import { SYSTEM_MENU } from './constants';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService<EnvConfig>,
    @InjectModel(Account.name) private accountModel: Model<Account>,
  ) {}

  async login({ login, password }: AuthDto) {
    const account = await this.accountModel.findOne({ login }).populate({
      path: 'funcionario',
      populate: {
        path: 'cargo',
      },
    });
    if (!account) throw new BadRequestException('login o password incorrectos');
    if (!bcrypt.compareSync(password, account.password)) throw new BadRequestException('login o password incorrectos');
    if (String(account._id) === this.configService.getOrThrow('id_root')) {
      return { token: this.generateRootToken(account) };
    }
    if (!account.funcionario || !account.activo) throw new BadRequestException('La cuenta ha sido desahabilidata');
    return { token: this.generateToken(account) };
  }

  async checkAuthStatus(id_account: string) {
    const account = await this.accountModel
      .findById(id_account)
      .populate({
        path: 'funcionario',
        populate: {
          path: 'cargo',
        },
      })
      .populate('rol');
    if (!account) throw new UnauthorizedException();
    if (account.rol.permissions.length === 0) throw new UnauthorizedException();
    if (String(account._id) === this.configService.getOrThrow('id_root')) {
      return { token: this.generateRootToken(account), menu: this.getSystemMenu(account.rol) };
    }
    if (!account.funcionario || !account.activo) throw new BadRequestException('La cuenta ha sido desahanilidata');
    return { token: this.generateToken(account), menu: this.getSystemMenu(account.rol) };
  }

  async getMyAuthDetails(id_account: string) {
    return await this.accountModel
      .findById(id_account)
      .populate({
        path: 'funcionario',
        populate: {
          path: 'cargo',
        },
      })
      .populate({
        path: 'dependencia',
        select: 'nombre codigo',
        populate: {
          path: 'institucion',
          select: 'nombre',
        },
      })
      .select('-password -rol');
  }

  async updateMyAccount(id_account: string, data: UpdateMyAccountDto) {
    const { password } = data;
    const salt = bcrypt.genSaltSync();
    const encryptedPassword = bcrypt.hashSync(password.toString(), salt);
    return await this.accountModel
      .findByIdAndUpdate(id_account, { password: encryptedPassword }, { new: true })
      .populate({
        path: 'funcionario',
        populate: {
          path: 'cargo',
        },
      })
      .populate({
        path: 'dependencia',
        select: 'nombre codigo',
        populate: {
          path: 'institucion',
          select: 'nombre',
        },
      })
      .select('-password -rol');
  }

  private generateRootToken(account: Account): string {
    const payload: JwtPayload = {
      id_account: account._id,
      id_dependency: '',
      officer: {
        fullname: 'ADMINISTRADOR',
        jobtitle: 'Configuraciones',
      },
    };
    return this.jwtService.sign(payload);
  }

  private generateToken(account: Account): string {
    const { funcionario, dependencia } = account;
    const payload: JwtPayload = {
      id_account: account._id,
      id_dependency: dependencia._id,
      officer: {
        fullname: [funcionario.nombre, funcionario.paterno, funcionario.materno].filter(Boolean).join(' '),
        jobtitle: funcionario.cargo ? funcionario.cargo.nombre : '',
      },
    };
    return this.jwtService.sign(payload);
  }

  private getSystemMenu(role: Role) {
    const resources = role.permissions.map((permision) => permision.resource);
    return SYSTEM_MENU.filter((menu) => {
      if (!menu.children) return resources.includes(menu.resource);
      return menu.children.filter((submenu) => resources.includes(submenu.resource)).length > 0;
    });
  }
}
