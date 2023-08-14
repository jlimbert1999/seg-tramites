import { WebSocketGateway, SubscribeMessage, MessageBody, OnGatewayConnection, WebSocketServer, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { GroupwareService } from './groupware.service';
import { CreateGroupwareDto } from './dto/create-groupware.dto';
import { UpdateGroupwareDto } from './dto/update-groupware.dto';


@WebSocketGateway(
  { cors: true }
)

export class GroupwareGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly groupwareService: GroupwareService,
    private readonly jwtService: JwtService
  ) { }

  handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token
      const decoded = this.jwtService.verify(token);
      this.groupwareService.addUser(client.id, decoded)
      this.server.emit('listar', this.groupwareService.getAll())

    } catch (error) {
      client.disconnect()
      return
    }
  }
  handleDisconnect(client: Socket) {
    this.groupwareService.removeUser(client.id)
    this.server.emit('listar', this.groupwareService.getAll())
  }

  test() {
    const s = this.groupwareService.users.find(user => user.id_account == '63af5e77ac7469b4ea9fedb8')
    console.log(s);
    s.socketIds.forEach(id => {
      this.server.to(id).emit('newmail', 'dsds')
    })
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
    return this.groupwareService.update(updateGroupwareDto.id, updateGroupwareDto);
  }

  @SubscribeMessage('removeGroupware')
  remove(@MessageBody() id: number) {
    return this.groupwareService.remove(id);
  }
}
