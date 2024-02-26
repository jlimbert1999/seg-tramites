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
    if (!account) throw new BadRequestException('Usuario o Contraseña incorrectos');
    if (!bcrypt.compareSync(password, account.password)) {
      throw new BadRequestException('Usuario o Contraseña incorrectos');
    }
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
      .populate('dependencia', 'codigo')
      .populate('rol');
    if (!account) throw new UnauthorizedException();
    const permissions = account.rol.permissions.reduce(
      (acc, curretn) => ({
        ...acc,
        [curretn.resource]: curretn.actions.map((el) => el),
      }),
      {},
    );
    if (String(account._id) === this.configService.getOrThrow('id_root')) {
      return {
        token: this.generateRootToken(account),
        menu: this.getSystemMenu(account.rol),
        code: '',
        permissions: permissions,
      };
    }
    if (!account.funcionario || !account.activo) {
      throw new UnauthorizedException('La cuenta ha sido deshanilidata');
    }

    return {
      token: this.generateToken(account),
      menu: this.getSystemMenu(account.rol),
      code: account.dependencia.codigo,
      permissions: permissions,
    };
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
    await this.accountModel.updateOne({ _id: id_account }, { password: encryptedPassword });
    return { message: 'Contraseña actualizada' };
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
    const menu = SYSTEM_MENU;
    const filteredItems = menu.filter((item) => {
      if (item.children) {
        item.children = item.children.filter((child) =>
          role.permissions.some((permission) => permission.resource === child.resource),
        );
        return item.children.length > 0;
      } else {
        return role.permissions.some((permission) => permission.resource === item.resource);
      }
    });
    return filteredItems;
  }
}
