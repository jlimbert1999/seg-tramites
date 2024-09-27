import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { Role } from '../../users/schemas';
import { CreateRoleDto, FilterRoleDto, UpdateRoleDto } from '../dtos';

@Injectable()
export class RoleService {
  constructor(@InjectModel(Role.name) private roleModel: Model<Role>) {}

  async findAll({ limit, offset, term }: FilterRoleDto) {
    const query: FilterQuery<Role> = {
      ...(term && { name: new RegExp(term, 'i') }),
    };
    const [roles, length] = await Promise.all([
      this.roleModel.find(query).limit(limit).skip(offset).sort({ _id: -1 }),
      this.roleModel.count(query),
    ]);
    return { roles, length };
  }

  async add(role: CreateRoleDto) {
    const createdRole = new this.roleModel(role);
    return await createdRole.save();
  }

  async edit(id: string, role: UpdateRoleDto) {
    return await this.roleModel.findByIdAndUpdate(id, role, { new: true });
  }

  async getActiveRoles() {
    return await this.roleModel.find({});
  }
}
