import { WebSocketGateway, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { GroupwareService } from './groupware.service';
import { CreateGroupwareDto } from './dto/create-groupware.dto';
import { UpdateGroupwareDto } from './dto/update-groupware.dto';

@WebSocketGateway()
export class GroupwareGateway {
  constructor(private readonly groupwareService: GroupwareService) {}

  @SubscribeMessage('createGroupware')
  create(@MessageBody() createGroupwareDto: CreateGroupwareDto) {
    console.log(createGroupwareDto);
    return this.groupwareService.create(createGroupwareDto);
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
