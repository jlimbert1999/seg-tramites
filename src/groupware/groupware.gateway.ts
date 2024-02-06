import { WebSocketGateway, OnGatewayConnection, WebSocketServer, OnGatewayDisconnect } from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { GroupwareService } from './groupware.service';
import { Comm } from 'src/procedures/schemas';
import { JwtPayload } from 'src/auth/interfaces/jwt.interface';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class GroupwareGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(private readonly groupwareService: GroupwareService, private readonly jwtService: JwtService) {}
  handleConnection(client: Socket) {
    console.log(client);
    try {
      const token = client.handshake.auth.token;
      const decoded: JwtPayload = this.jwtService.verify(token);
      if (decoded.id_dependency !== '') client.join(decoded.id_dependency);
      this.groupwareService.addUser(client.id, decoded);
      this.server.emit('listar', this.groupwareService.getConnectedUsers());
    } catch (error) {
      client.disconnect();
      return;
    }
  }
  handleDisconnect(client: Socket) {
    this.groupwareService.removeUser(client.id);
    client.broadcast.emit('listar', this.groupwareService.getConnectedUsers());
  }

  sendMails(data: Comm[]) {
    data.forEach((mail) => {
      const user = this.groupwareService.getUser(String(mail.receiver.cuenta._id));
      if (user) {
        user.socketIds.forEach((socketId) => {
          this.server.to(socketId).emit('new-mail', mail);
        });
      }
    });
  }

  cancelMails(data: Comm[]) {
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
}
