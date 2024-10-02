import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  ConnectedSocket,
  WebSocketServer,
  MessageBody,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { GroupwareService } from './groupware.service';
import { JwtPayload } from 'src/auth/interfaces/jwt.interface';
import { Communication } from 'src/procedures/schemas';

interface expelClientProps {
  id_account: string;
  message: string;
}
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class GroupwareGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(private groupwareService: GroupwareService, private jwtService: JwtService) {}

  handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;
      const decoded: JwtPayload = this.jwtService.verify(token);
      if (decoded.id_dependency) client.join(decoded.id_dependency);
      this.groupwareService.onClientConnected(client.id, decoded);
      this.server.emit('listar', this.groupwareService.getClients());
    } catch (error) {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.groupwareService.onClientDisconnected(client.id);
    client.broadcast.emit('listar', this.groupwareService.getClients());
  }

  sendMails(data: Communication[]) {
    data.forEach((mail) => {
      const user = this.groupwareService.getUser(String(mail.receiver.cuenta._id));
      if (user) {
        user.socketIds.forEach((socketId) => {
          this.server.to(socketId).emit('new-mail', mail);
        });
      }
    });
  }

  cancelMails(data: Communication[]) {
    data.forEach(({ _id, receiver }) => {
      const user = this.groupwareService.getUser(String(receiver.cuenta._id));
      if (user) {
        user.socketIds.forEach((socketId) => {
          this.server.to(socketId).emit('cancel-mail', _id);
        });
      }
    });
  }

  notifyUnarchive(id_dependency: string, id_mail: string) {
    this.server.to(id_dependency).emit('unarchive-mail', id_mail);
  }

  notifyNew(publication: any) {
    this.server.emit('news', publication);
  }

  @SubscribeMessage('expel')
  handleExpel(@ConnectedSocket() socket: Socket, @MessageBody() { id_account, message }: expelClientProps) {
    const client = this.groupwareService.remove(id_account);
    if (!client) return;
    socket.to(client.socketIds).emit('has-expel', message);
  }
}
