import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';

import { JwtPayload } from './interfaces/jwt.interface';
import { AuthDto } from './dto/auth.dto';
import { UpdateMyAccountDto } from './dto/my-account.dto';
import { SystemMenu } from './constants/system-menu';
import { Account } from './schemas/account.schema';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectModel(Account.name) private accountModel: Model<Account>,
  ) {}

  async loginUser(authDto: AuthDto) {
    const account = await this.accountModel
      .findOne({ login: authDto.login })
      .populate('rol')
      .populate({
        path: 'funcionario',
        populate: {
          path: 'cargo',
        },
      });
    if (!account) throw new BadRequestException('login o password incorrectos');
    if (!bcrypt.compareSync(authDto.password, account.password))
      throw new BadRequestException('login o password incorrectos');
    if (account._id == '639dde6d495c82b3794d6606')
      return {
        token: this.getToken({
          id_account: account._id,
          id_dependency: '',
          officer: {
            fullname: 'ADMINISTRADOR',
            jobtitle: 'Configuraciones',
          },
        }),
        resources: account.rol.permissions.map(
          (privilege) => privilege.resource,
        ),
      };
    if (!account.activo || !account.funcionario)
      throw new BadRequestException('La cuenta ha sido deshabilitada');
    return {
      token: this.getToken({
        id_account: account._id,
        id_dependency: account.dependencia._id,
        officer: {
          fullname: `${account.funcionario.nombre} ${account.funcionario.paterno} ${account.funcionario.materno}`,
          jobtitle: account.funcionario.cargo
            ? account.funcionario.cargo.nombre
            : '',
        },
      }),
      resources: account.rol.permissions.map((privilege) => privilege.resource),
    };
  }

  async checkAuthStatus(id_account: string) {
    const account = await this.accountModel
      .findById(id_account)
      .populate('rol')
      .populate('dependencia')
      .populate({
        path: 'funcionario',
        populate: {
          path: 'cargo',
        },
      });
    if (!account) throw new UnauthorizedException();
    const resources = account.rol.permissions.map(
      (privilege) => privilege.resource,
    );
    if (resources.length === 0) throw new UnauthorizedException();
    if (id_account == '639dde6d495c82b3794d6606')
      return {
        token: this.getToken({
          id_account: account._id,
          id_dependency: '',
          officer: {
            fullname: 'ADMINISTRADOR',
            jobtitle: 'Configuraciones',
          },
        }),
        menu: this.getSystemMenu(resources),
        resources,
      };
    if (!account.activo || !account.funcionario)
      throw new UnauthorizedException('La cuenta ha sido deshabilitada');
    return {
      token: this.getToken({
        id_account: account._id,
        id_dependency: account.dependencia._id,
        officer: {
          fullname: `${account.funcionario.nombre} ${account.funcionario.paterno} ${account.funcionario.materno}`,
          jobtitle: account.funcionario.cargo
            ? account.funcionario.cargo.nombre
            : '',
        },
      }),
      menu: this.getSystemMenu(resources),
      code: account.dependencia.codigo,
      resources,
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
    return await this.accountModel
      .findByIdAndUpdate(
        id_account,
        { password: encryptedPassword },
        { new: true },
      )
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

  getToken(payload: JwtPayload) {
    return this.jwtService.sign(payload);
  }

  getSystemMenu(myResources: string[]) {
    const allowedResources = SystemMenu.filter((menuItem) =>
      myResources.includes(menuItem.resource),
    );
    const groupedMenu = allowedResources.reduce((result, menuItem) => {
      if (!menuItem.group) {
        const category = menuItem.routerLink;
        result[category] = menuItem;
      } else {
        const { text, icon } = menuItem.group;
        if (!result[text]) {
          result[text] = {
            text: text,
            icon,
            children: [],
          };
        }
        result[text].children.push({
          text: menuItem.text,
          icon: menuItem.icon,
          routerLink: menuItem.routerLink,
        });
      }
      return result;
    }, {});
    return Object.values(groupedMenu);
  }
}
