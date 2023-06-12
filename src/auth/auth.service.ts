import { BadRequestException, Injectable } from '@nestjs/common';
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
            .populate('dependencia')
        if (!account) throw new BadRequestException('login o password incorrectos')
        if (!bcrypt.compareSync(authDto.password, account.password)) throw new BadRequestException('login o password incorrectos')
        if (account._id == '639dde6d495c82b3794d6606') return {
            token: this.getToken({
                id_account: account._id,
                code: ''
            }),
            resources: account.rol.privileges.map(privilege => privilege.resource)
        }
        if (!account.activo || !account.funcionario) throw new BadRequestException('la cuenta ha sido deshabilitada')
        return {
            token: this.getToken({
                id_account: account._id,
                code: account.dependencia.code
            }),
            resources: account.rol.privileges.map(privilege => privilege.resource)
        }
    }

    async checkAuthStatus(id_account: string) {
        const account = await this.accountModel.findById(id_account, 'rol funcionario dependencia')
            .populate('funcionario')
            .populate('rol')
            .populate('dependencia')
        const resources = account.rol.privileges.map(privilege => privilege.resource)
        if (id_account == '639dde6d495c82b3794d6606')
            return {
                fullname: `ADMINISTRADOR`,
                jobtitle: 'Configuraciones',
                resources,
                menu: this.getMenu(),
                token: this.getToken({
                    id_account: account._id
                })
            }
        return {
            fullname: `${account.funcionario.nombre} ${account.funcionario.paterno} ${account.funcionario.materno}`.trim(),
            jobtitle: account.funcionario.cargo,
            resources,
            menu: this.getMenu(),
            token: this.getToken({
                id_account: account._id,
                code: account.dependencia.code
            })
        }
    }
    getToken(payload: JwtPayload) {
        return this.jwtService.sign(payload)
    }
    getMenu() {
        return []
    }
}
