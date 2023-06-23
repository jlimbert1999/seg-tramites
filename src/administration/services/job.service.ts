import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Job } from '../schemas/job.schema';
import { CreateJobDto } from '../dto/create-job.dto';
import { UpdateJobDto } from '../dto/update-job.dto';

@Injectable()
export class JobService {
    constructor(@InjectModel(Job.name) private jobModel: Model<Job>,
    ) {

    }

    async searchDependents(text: string) {
        const regex = new RegExp(text, 'i')
        return this.jobModel.find({ superior: { $exists: true }, nombre: regex }).limit(5)
    }

    async get(limit: number, offset: number) {
        const [jobs, length] = await Promise.all(
            [
                this.jobModel.find({}).sort({ _id: -1 }).skip(offset).limit(limit),
                this.jobModel.count()
            ]
        )
        return { jobs, length }

    }
    async search(limit: number, offset: number, text: string) {
        offset = offset * limit
        const regex = new RegExp(text, 'i')
        const [jobs, length] = await Promise.all(
            [
                this.jobModel.find({ nombre: regex })
                    .skip(offset)
                    .limit(limit),
                this.jobModel.count({ role: regex })
            ]
        )
        return { jobs, length }
    }

    async add(job: CreateJobDto) {
        const createdJob = new this.jobModel(job)
        return await createdJob.save()
    }
    async eidt(id: string, job: UpdateJobDto) {
        return this.jobModel.findByIdAndUpdate(id, job)
    }
}
