import { Injectable } from '@nestjs/common';
import { CreateGroupwareDto } from './dto/create-groupware.dto';
import { UpdateGroupwareDto } from './dto/update-groupware.dto';

@Injectable()
export class GroupwareService {
  create(createGroupwareDto: CreateGroupwareDto) {
    return 'This action adds a new groupware';
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
