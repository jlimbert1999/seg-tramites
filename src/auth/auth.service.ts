import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';

import { AuthDto, UpdateMyAccountDto } from './dto';
import { EnvConfig, JwtPayload, Menu } from './interfaces';
import { Account, Role } from 'src/users/schemas';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService<EnvConfig>,
    @InjectModel(Account.name) private accountModel: Model<Account>,
  ) {}

  async login({ login, password }: AuthDto) {
    const account = await this.accountModel
      .findOne({ login })
      .populate('rol')
      .populate({
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
      return { token: this.generateRootToken(account), url: '/home' };
    }
    if (!account.funcionario || !account.activo) throw new BadRequestException('La cuenta ha sido desahabilidata');
    return { token: this.generateToken(account), url: this._getInitialRoute(account) };
  }

  async checkAuthStatus(id_account: string) {
    console.log(id_account);
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
    if (String(account._id) === this.configService.getOrThrow('id_root')) {
      return {
        token: this.generateRootToken(account),
        menu: this._getFrontMenu(account.rol),
        permissions: this._getPermissions(account.rol),
        code: '',
      };
    }
    if (!account.funcionario || !account.activo) {
      throw new UnauthorizedException('La cuenta ha sido deshanilidata');
    }
    return {
      token: this.generateToken(account),
      menu: this._getFrontMenu(account.rol),
      permissions: this._getPermissions(account.rol),
      code: account.dependencia.codigo,
      updatedPassword: account.updatedPassword,
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
    await this.accountModel.updateOne({ _id: id_account }, { password: encryptedPassword, updatedPassword: true });
    return { message: 'Contraseña actualizada' };
  }

  private generateRootToken(account: Account): string {
    const payload: JwtPayload = {
      id_account: account._id,
      id_dependency: '',
      officer: {
        fullname: 'Administrador',
        jobtitle: 'CONFIGURACIONES',
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

  private _getPermissions({ permissions }: Role) {
    return permissions.reduce((result, { actions, resource }) => ({ [resource]: actions, ...result }), {});
  }

  private _getFrontMenu({ permissions }: Role) {
    const json = fs.readFileSync('src/config/menu.json', 'utf8');
    const SystemMenu: Menu[] = JSON.parse(json);
    return SystemMenu.filter((menu) => {
      if (!menu.children) return permissions.some(({ resource }) => resource === menu.resource);
      menu.children = menu.children.filter((submenu) =>
        permissions.some(({ resource }) => resource === submenu.resource),
      );
      return menu.children.length > 0;
    });
  }

  private _getInitialRoute({ rol, updatedPassword }: Account): string {
    if (!updatedPassword) return '/home/settings';
    return '/home/main';
  }
}
