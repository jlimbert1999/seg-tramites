import { Injectable } from '@nestjs/common';
import { CreateGroupwareDto } from './dto/create-groupware.dto';
import { UpdateGroupwareDto } from './dto/update-groupware.dto';
import { userSocket } from './interfaces/user-socket.interface';
import { JwtPayload } from 'src/auth/interfaces/jwt.interface';


@Injectable()
export class GroupwareService {
  users: userSocket[]
  constructor() {
    this.users = []
  }


  addUser(id_socket: string, payloadToken: JwtPayload) {
    const indexFound = this.users.findIndex(user => user.id_account == payloadToken.id_account)
    if (indexFound === -1) {
      const newUserSocket: userSocket = {
        socketIds: [id_socket],
        id_account: payloadToken.id_account,
        id_dependency: payloadToken.id_dependencie,
        officer: payloadToken.officer
      }
      this.users.push(newUserSocket);
    }
    else {
      this.users[indexFound].socketIds.push(id_socket)
    }
  }

  removeUser(id_socket: string) {
    const indexFound = this.users.findIndex(acc => acc.socketIds.includes(id_socket));
    if (indexFound !== -1) {
      const mySocketConections = this.users[indexFound].socketIds.filter(element => element !== id_socket)
      this.users[indexFound].socketIds = mySocketConections
      if (mySocketConections.length === 0) {
        this.users = this.users.filter(user => user.id_account !== this.users[indexFound].id_account)
      }
    }
  }
  
  getUser(id_account: string) {
    return this.users.find(user => user.id_account === id_account)
  }

  getAll() {
    return this.users
  }

  findOne(id: number) {
    return `This action returns a #${id} groupware`;
  }

  update(id: number, updateGroupwareDto: UpdateGroupwareDto) {
    return `This action updates a #${id} groupware`;
  }

  remove(id: number) {
    return `This action removes a #${id} groupware`;
  }
}
