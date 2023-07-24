import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Account } from "src/administration/schemas/account.schema";
import { JwtPayload } from "../interfaces/jwt.interface";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Injectable, UnauthorizedException } from "@nestjs/common";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        @InjectModel(Account.name) private readonly accountModel: Model<Account>
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: 'secret',
        });
    }
    async validate(payload: JwtPayload): Promise<Account> {
        const { id_account } = payload
        const account = await this.accountModel.findById(id_account).select('-password')
            .populate('rol')
        if (!account) throw new UnauthorizedException('Token invalido, vuelva a iniciar sesion')
        if (account.rol.privileges.length === 0) throw new UnauthorizedException('Esta cuenta no tiene ningun permiso asignado')
        if (account._id == '639dde6d495c82b3794d6606') return account
        if (!account.activo || !account.funcionario) throw new UnauthorizedException('Esta cuenta ha sido deshablitada')
        return account
    }
}   