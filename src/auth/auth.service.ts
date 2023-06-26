import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { JwtPayload } from './interfaces/jwt.interface';
import { Account } from 'src/administration/schemas/account.schema';
import { AuthDto } from './dto/auth.dto';

@Injectable()
export class AuthService {

    constructor(
        private jwtService: JwtService,
        @InjectModel(Account.name) private accountModel: Model<Account>
    ) {
    }

    async loginUser(authDto: AuthDto) {
        const account = await this.accountModel.findOne({ login: authDto.login })
            .populate('rol')
            .populate('funcionario')
        if (!account) throw new BadRequestException('login o password incorrectos')
        if (!bcrypt.compareSync(authDto.password, account.password)) throw new BadRequestException('login o password incorrectos')
        if (account._id == '639dde6d495c82b3794d6606') return {
            token: this.getToken({
                id_account: account._id,
                id_dependencie: '',
                officer: {
                    fullname: 'ADMINISTRADOR',
                    jobtitle: ''
                }
            }),
            resources: account.rol.privileges.map(privilege => privilege.resource)
        }
        if (!account.activo || !account.funcionario) throw new BadRequestException('la cuenta ha sido deshabilitada')
        return {
            token: this.getToken({
                id_account: account._id,
                id_dependencie: account.dependencia._id,
                officer: {
                    fullname: `${account.funcionario.nombre} ${account.funcionario.paterno} ${account.funcionario.materno}`,
                    //TODO = CHANGE FOR JOB POPULATE IN OIFFCER
                    jobtitle: ''
                }
            }),
            resources: account.rol.privileges.map(privilege => privilege.resource)
        }
    }

    async checkAuthStatus(id_account: string) {
        const account = await this.accountModel.findById(id_account, 'rol funcionario dependencia')
            .populate('funcionario', 'nombre paterno materno cargo')
            .populate('rol', 'privileges')
            .populate('dependencia', 'codigo')
        if (!account) throw new UnauthorizedException()
        const resources = account.rol.privileges.map(privilege => privilege.resource)
        if (resources.length === 0) throw new UnauthorizedException()
        if (id_account == '639dde6d495c82b3794d6606')
            return {
                token: this.getToken({
                    id_account: account._id,
                    id_dependencie: '',
                    officer: {
                        fullname: 'ADMINISTRADOR',
                        jobtitle: ''
                    }
                }),
                menu: this.getMenu(resources),
                resources
            }
        return {
            token: this.getToken({
                id_account: account._id,
                id_dependencie: account.dependencia._id,
                officer: {
                    fullname: `${account.funcionario.nombre} ${account.funcionario.paterno} ${account.funcionario.materno}`,
                    jobtitle: ''
                }
            }),
            menu: this.getMenu(resources),
            code: account.dependencia.codigo,
            resources
        }
    }

    getToken(payload: JwtPayload) {
        return this.jwtService.sign(payload)
    }
    getMenu(resources: string[]) {
        const menu = []
        resources.forEach(resource => {
            switch (resource) {
                case 'cuentas':
                    menu.push(
                        {
                            text: "Cuentas",
                            icon: "account_circle",
                            routerLink: "configuraciones/cuentas",
                        }
                    )
                    break;
                case 'usuarios':
                    menu.push(
                        {
                            text: "Funcionarios",
                            icon: "person",
                            routerLink: "configuraciones/funcionarios",
                        },
                    )
                    break;
                case 'roles':
                    menu.push(
                        {
                            text: "Roles",
                            icon: "badge",
                            routerLink: "configuraciones/roles",
                        },
                    )
                    break
                case 'cargos':
                    menu.push(
                        {
                            text: "Cargos",
                            icon: "badge",
                            children: [
                                {
                                    text: "Registros",
                                    icon: "badge",
                                    routerLink: "configuraciones/cargos"
                                },
                                {
                                    text: "Organigrama",
                                    icon: "badge",
                                    routerLink: "configuraciones/organigrama"
                                },
                            ]
                        },
                    )
                    break
                case 'instituciones':
                    menu.push(
                        {
                            text: "Instituciones",
                            icon: "apartment",
                            routerLink: "configuraciones/instituciones",
                        },
                    )
                    break
                case 'dependencias':
                    menu.push(
                        {
                            text: "Dependencias",
                            icon: "holiday_village",
                            routerLink: "configuraciones/dependencias",
                        }
                    )
                    break
                case 'tipos':
                    menu.push(
                        {
                            text: "Tipos",
                            icon: "folder_copy",
                            routerLink: "configuraciones/tipos",
                        },
                    )
                    break;
                case 'externos':
                    menu.push(
                        {
                            text: "Externos",
                            icon: "folder_shared",
                            routerLink: "tramites/externos",
                        }
                    )
                    break;
                case 'internos':
                    menu.push(
                        {
                            text: "Internos",
                            icon: "topic",
                            routerLink: "tramites/internos"
                        }
                    )
                    break;
                case 'entradas':
                    menu.push(
                        {
                            text: "Bandeja entrada",
                            icon: "drafts",
                            routerLink: "bandejas/entrada",
                        },
                    )
                    break;
                case 'salidas':
                    menu.push(
                        {
                            text: "Bandeja salida",
                            icon: "mail",
                            routerLink: "bandejas/salida",
                        },
                    )
                    break;
                case 'archivos':
                    menu.push(
                        {
                            text: "Archivos",
                            icon: "file_copy",
                            routerLink: "archivos",
                        },
                    )
                    break;
                case 'busquedas':
                    menu.push(
                        {
                            text: "Busquedas",
                            icon: "search",
                            routerLink: "busquedas",
                        },
                    )
                    break;
                default:
                    break;
            }
        })
        return menu
    }
}
