import { WebSocketGateway, SubscribeMessage, MessageBody, OnGatewayConnection, WebSocketServer, OnGatewayDisconnect } from '@nestjs/websockets';
import { GroupwareService } from './groupware.service';
import { CreateGroupwareDto } from './dto/create-groupware.dto';
import { UpdateGroupwareDto } from './dto/update-groupware.dto';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

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
  handleConnection(client: Socket, ...args: any[]) {
    try {
      const token = client.handshake.auth.token
      const decoded = this.jwtService.verify(token);
      console.log(decoded);
      this.groupwareService.addUser(client.id, decoded)
      // next();
    } catch (error) {
      client.disconnect()
    }
  }
  handleDisconnect(client: Socket) {
    console.log(client.id);
  }

  @SubscribeMessage('createGroupware')
  create(@MessageBody() createGroupwareDto: CreateGroupwareDto) {
    console.log(createGroupwareDto);
    // return this.groupwareService.create(createGroupwareDto);
  }

  @SubscribeMessage('findAllGroupware')
  findAll() {
    return this.groupwareService.findAll();
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
