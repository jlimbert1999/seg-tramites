import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Document, FilterQuery, Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { User, UserDocument } from '../schemas';
import { CreateUserDto, UpdateUserDto } from '../dtos';

import { Account } from 'src/modules/administration/schemas';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(Account.name) private accountModel: Model<Account>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  // ! Delete after update
  async generate() {
    const accounts = await this.accountModel.find({}).populate('funcionario');
    for (const element of accounts) {
      const { login, password, updatedPassword, activo, rol } = element;
      const fullname = element.funcionario
        ? [
            element.funcionario.nombre,
            element.funcionario.paterno,
            element.funcionario.materno,
          ]
            .filter(Boolean)
            .join(' ')
        : 'Unknown';
      const user = new this.userModel({
        fullname,
        login,
        password,
        updatedPassword,
        isActive: activo,
        role: rol,
      });
      await user.save();
      if (!element.isRoot) {
        await this.accountModel.updateOne(
          { _id: element._id },
          { user: user._id },
        );
      } else {
        console.log('un usuario root', element);
      }
    }
  }

  async findAll({ limit, offset, term }: PaginationDto) {
    const query: FilterQuery<User> = {
      ...(term && { fullname: new RegExp(term, 'i') }),
    };
    const [users, length] = await Promise.all([
      this.userModel.find(query).skip(offset).limit(limit).sort({ _id: -1 }),
      this.userModel.count(query),
    ]);
    return { users: users.map((user) => this._plainUser(user)), length };
  }

  async create(userDto: CreateUserDto) {
    const createdUser = new this.userModel(userDto);
    await this._checkDuplicateLogin(userDto.login);
    userDto.password = this._encryptPassword(userDto.password);
    await createdUser.save();
    return this._plainUser(createdUser);
  }

  async update(id: string, userDto: UpdateUserDto) {
    const userDb = await this.userModel.findById(id);
    if (!userDb) throw new NotFoundException(`El usuario ${id} no existe`);
    if (userDb.login !== userDto.login) {
      await this._checkDuplicateLogin(userDto.login);
    }
    if (userDto.password) {
      userDto.password = this._encryptPassword(userDto.password);
    }
    const updatedUser = await this.userModel.findByIdAndUpdate(id, userDto, {
      new: true,
    });
    return this._plainUser(updatedUser);
  }

  private async _checkDuplicateLogin(login: string): Promise<void> {
    const duplicate = await this.userModel.findOne({ login });
    if (duplicate) {
      throw new BadRequestException(`El login ${login} ya existe`);
    }
  }

  private _encryptPassword(password: string): string {
    const salt = bcrypt.genSaltSync();
    return bcrypt.hashSync(password, salt);
  }

  private _plainUser(user: User) {
    const result = user instanceof Document ? user.toObject() : user;
    delete result.password;
    return result;
  }
}
