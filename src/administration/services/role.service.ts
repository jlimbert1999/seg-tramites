import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role } from '../schemas';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';

@Injectable()
export class RoleService {

    constructor(
        @InjectModel(Role.name) private roleModel: Model<Role>
    ) {
    }
    async get(limit: number, offset: number) {
        offset = offset * limit
        const [roles, length] = await Promise.all(
            [
                this.roleModel.find({})
                    .skip(offset)
                    .limit(limit)
                    .sort({ _id: -1 }),
                this.roleModel.count({})
            ]
        )
        return { roles, length }
    }
    async search(limit: number, offset: number, text: string) {
        offset = offset * limit
        const regex = new RegExp(text, 'i')
        const [roles, length] = await Promise.all(
            [
                this.roleModel.find({ role: regex })
                    .skip(offset)
                    .limit(limit),
                this.roleModel.count({ role: regex })
            ]
        )
        return { roles, length }
    }
    async add(role: CreateRoleDto) {
        const createdRole = new this.roleModel(role)
        return await createdRole.save()
    };
    async edit(id_role: string, role: UpdateRoleDto) {
        return await this.roleModel.findByIdAndUpdate(id_role, role, { new: true })
    };

}
