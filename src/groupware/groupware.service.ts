import { Injectable } from '@nestjs/common';
import { CreateGroupwareDto } from './dto/create-groupware.dto';
import { UpdateGroupwareDto } from './dto/update-groupware.dto';
import { userSocket } from './interfaces/user-socket.interface';

@Injectable()
export class GroupwareService {
  users: userSocket[] = []


  addUser(id_socket: string, userSocket: userSocket) {
    const indexFound = this.users.findIndex(user => user.id_account == userSocket.id_account)
    if (indexFound === -1) {
      userSocket.socketIds.push(id_socket)
      this.users.push(userSocket);
    }
    else {
      this.users[indexFound].socketIds.push(id_socket)
    }
  }

  findAll() {
    return `This action returns all groupware`;
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
