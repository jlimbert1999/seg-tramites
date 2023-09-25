import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  WebSocketServer,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { GroupwareService } from './groupware.service';
import { CreateGroupwareDto } from './dto/create-groupware.dto';
import { UpdateGroupwareDto } from './dto/update-groupware.dto';
import { Communication } from 'src/procedures/schemas';

@WebSocketGateway({ cors: true })
export class GroupwareGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly groupwareService: GroupwareService,
    private readonly jwtService: JwtService,
  ) {}

  handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;
      const decoded = this.jwtService.verify(token);
      this.groupwareService.addUser(client.id, decoded);
      this.server.emit('listar', this.groupwareService.getAll());
    } catch (error) {
      client.disconnect();
      return;
    }
  }
  handleDisconnect(client: Socket) {
    this.groupwareService.removeUser(client.id);
    client.broadcast.emit('listar', this.groupwareService.getAll());
  }

  sendMails(data: Communication[]) {
    data.forEach((mail) => {
      const user = this.groupwareService.getUser(
        String(mail.receiver.cuenta._id),
      );
      if (user) {
        user.socketIds.forEach((socketId) => {
          this.server.to(socketId).emit('new-mail', mail);
        });
      }
    });
  }
  cancelMails(data: { id_receiver: string, id_mail: string }[]) {
    data.forEach(({ id_mail, id_receiver }) => {
      const user = this.groupwareService.getUser(id_receiver);
      if (user) {
       
        user.socketIds.forEach((socketId) => {
          this.server.to(socketId).emit('cancel-mail', id_mail);
        });
      }
    });
  }

  @SubscribeMessage('createGroupware')
  create(@MessageBody() createGroupwareDto: CreateGroupwareDto) {
    // return this.groupwareService.create(createGroupwareDto);
  }

  @SubscribeMessage('findOneGroupware')
  findOne(@MessageBody() id: number) {
    return this.groupwareService.findOne(id);
  }

  @SubscribeMessage('updateGroupware')
  update(@MessageBody() updateGroupwareDto: UpdateGroupwareDto) {
    return this.groupwareService.update(
      updateGroupwareDto.id,
      updateGroupwareDto,
    );
  }

  @SubscribeMessage('removeGroupware')
  remove(@MessageBody() id: number) {
    return this.groupwareService.remove(id);
  }
}
