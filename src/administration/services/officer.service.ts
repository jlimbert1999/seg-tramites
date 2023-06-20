import { BadRequestException, Injectable } from '@nestjs/common';
import { Officer } from '../schemas';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateOfficerDto } from '../dto/create-officer.dto';
import { UpdateOfficerDto } from '../dto/update-officer.dto';

@Injectable()
export class OfficerService {
    constructor(@InjectModel(Officer.name) private officerModel: Model<Officer>) {
    }
    async add(officer: CreateOfficerDto) {
        const { dni } = officer
        const duplicate = await this.officerModel.findOne({ dni })
        if (duplicate) throw new BadRequestException('El dni introducido ya existe');
        const createdOfficer = new this.officerModel(officer)
        return await createdOfficer.save()
    }

    async get(limit: number, offset: number) {
        const [officers, length] = await Promise.all(
            [
                this.officerModel.find({}).sort({ _id: -1 }).skip(offset).limit(limit),
                this.officerModel.count()
            ]
        )
        return { officers, length }
    }

    async edit(id_officer: string, officer: UpdateOfficerDto) {
        const { dni } = officer
        const officerDb = await this.officerModel.findById(id_officer)
        if (!officerDb) throw new BadRequestException('El funcionario no existe')
        if (officerDb.dni !== dni) {
            const duplicate = await this.officerModel.findOne({ dni })
            if (duplicate) throw new BadRequestException('El dni introducido ya existe');
        }
        return await this.officerModel.findByIdAndUpdate(id_officer, officer, { new: true })
    }
}
