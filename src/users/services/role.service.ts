import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role } from '../../users/schemas';
import { CreateRoleDto, UpdateRoleDto } from '../../users/dtos';

@Injectable()
export class RoleService {
  constructor(@InjectModel(Role.name) private roleModel: Model<Role>) {}
  async getRoles() {
    return await this.roleModel.find({});
  }
  async get() {
    const [roles, length] = await Promise.all([this.roleModel.find({}).sort({ _id: -1 }), this.roleModel.count({})]);
    return { roles, length };
  }
  async search(text: string) {
    const regex = new RegExp(text, 'i');
    const [roles, length] = await Promise.all([
      this.roleModel.find({ role: regex }),
      this.roleModel.count({ role: regex }),
    ]);
    return { roles, length };
  }

  async add(role: CreateRoleDto) {
    const createdRole = new this.roleModel(role);
    return await createdRole.save();
  }
  async edit(id_role: string, role: UpdateRoleDto) {
    return await this.roleModel.findByIdAndUpdate(id_role, role, { new: true });
  }
}
