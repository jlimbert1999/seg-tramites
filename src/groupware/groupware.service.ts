import { Injectable } from '@nestjs/common';
import { userSocket } from './interfaces/user-socket.interface';
import { JwtPayload } from 'src/auth/interfaces/jwt.interface';

@Injectable()
export class GroupwareService {
  private users: Record<string, userSocket> = {};

  addUser(id_socket: string, payloadToken: JwtPayload): void {
    const { id_account, id_dependency, officer } = payloadToken;
    if (this.users[id_account]) {
      this.users[id_account].socketIds.push(id_socket);
      return;
    }
    this.users[id_account] = {
      id_dependency,
      id_account,
      officer,
      socketIds: [id_socket],
    };
  }

  removeUser(id_socket: string) {
    const disconnectedUser = Object.values(this.users).find((user) => user.socketIds.includes(id_socket));
    if (!disconnectedUser) return;
    const { id_account, socketIds } = disconnectedUser;
    this.users[id_account].socketIds = socketIds.filter((id) => id !== id_socket);
    if (this.users[id_account].socketIds.length === 0) delete this.users[id_account];
  }

  getUser(id_account: string): userSocket {
    return this.users[id_account];
  }

  getClients() {
    return Object.values(this.users);
  }
}
