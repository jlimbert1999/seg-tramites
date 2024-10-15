import { Injectable } from '@nestjs/common';
import { userSocket } from './interfaces/user-socket.interface';
import { JwtPayload } from 'src/modules/auth/interfaces/jwt.interface';

@Injectable()
export class GroupwareService {
  private clients: Record<string, userSocket> = {};

  onClientConnected(sockerId: string, payload: JwtPayload): void {
    const { socketIds } = this.clients[payload.userId] ?? { socketIds: [] };
    socketIds.push(sockerId);
    this.clients[payload.userId] = { ...payload, socketIds };
  }

  onClientDisconnected(id_socket: string) {
    const client = Object.values(this.clients).find(({ socketIds }) =>
      socketIds.includes(id_socket),
    );
    if (!client) return;
    this.clients[client.userId].socketIds = client.socketIds.filter(
      (id) => id !== id_socket,
    );
    if (this.clients[client.userId].socketIds.length === 0)
      delete this.clients[client.userId];
  }

  remove(id_account: string) {
    const client = this.clients[id_account];
    if (client) delete this.clients[id_account];
    return client;
  }

  getUser(id_account: string): userSocket {
    return this.clients[id_account];
  }

  getClients(): userSocket[] {
    return Object.values(this.clients);
  }
}
