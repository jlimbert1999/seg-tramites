import { Injectable } from '@nestjs/common';
import { userSocket } from './interfaces/user-socket.interface';
import { JwtPayload } from 'src/auth/interfaces/jwt.interface';

@Injectable()
export class GroupwareService {
  private clients: Record<string, userSocket> = {};

  onClientConnected(id_socket: string, payload: JwtPayload): void {
    if (this.clients[payload.id_account]) {
      this.clients[payload.id_account].socketIds.push(id_socket);
      return;
    }
    this.clients[payload.id_account] = { ...payload, socketIds: [id_socket] };
  }

  onClientDisconnected(id_socket: string) {
    const client = Object.values(this.clients).find(({ socketIds }) => socketIds.includes(id_socket));
    if (!client) return;
    this.clients[client.id_account].socketIds = client.socketIds.filter((id) => id !== id_socket);
    if (this.clients[client.id_account].socketIds.length === 0) delete this.clients[client.id_account];
  }

  remove(id_account: string) {
    const client = this.clients[id_account];
    if (client) delete this.clients[id_account];
    return client;
  }

  getUser(id_account: string): userSocket {
    return this.clients[id_account];
  }

  getClients() {
    return Object.values(this.clients);
  }
}
