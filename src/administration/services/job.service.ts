import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Job } from '../schemas/job.schema';

import { Officer } from '../../users/schemas';
import { CreateJobDto, UpdateJobDto } from '../dtos';

export interface organizationData {
  _id: string;
  nombre: string;
  superior: null | string;
  isRoot: boolean;
  organigram: {
    _id: string;
    nombre: string;
    superior: string;
    isRoot: boolean;
    officer: Officer | null;
  }[];
  officer: Officer | null;
}

export interface orgChartData {
  name: string;
  data: {
    id: string;
    pid?: string;
    name: string;
    title: string;
    img: string;
  }[];
}

@Injectable()
export class JobService {
  constructor(
    @InjectModel(Job.name) private jobModel: Model<Job>,
    @InjectModel(Officer.name) private officerModel: Model<Officer>,
  ) {}

  async searchJobForUser(text: string) {
    const regex = new RegExp(text, 'i');
    return await this.jobModel
      .aggregate()
      .match({ nombre: regex })
      .lookup({
        from: 'funcionarios',
        localField: '_id',
        foreignField: 'cargo',
        as: 'funcionario',
      })
      .match({ funcionario: { $size: 0 } })
      .limit(7)
      .project({ funcionario: 0 });
  }
  async searchDependents(text: string) {
    const regex = new RegExp(text, 'i');
    return this.jobModel.find({ superior: null, isRoot: false, nombre: regex }).limit(5);
  }
  async getDependentsOfSuperior(idSuperior: string) {
    return this.jobModel.find({ superior: idSuperior });
  }
  async removeDependent(idDependentJob: string) {
    return this.jobModel.findByIdAndUpdate(idDependentJob, { superior: null });
  }

  async findAll(limit: number, offset: number) {
    const [jobs, length] = await Promise.all([
      this.jobModel.find({}).lean().sort({ _id: -1 }).skip(offset).limit(limit),
      this.jobModel.count(),
    ]);
    return { jobs, length };
  }

  async search(limit: number, offset: number, term: string) {
    const regex = new RegExp(term, 'i');
    const [jobs, length] = await Promise.all([
      this.jobModel.find({ nombre: regex }).lean().skip(offset).limit(limit),
      this.jobModel.count({ nombre: regex }),
    ]);
    return { jobs, length };
  }

  async create(job: CreateJobDto) {
    const { nombre } = job;
    const createdJob = new this.jobModel({ nombre });
    const newJob = await createdJob.save();
    // for (const dependent of dependents) {
    //   await this.jobModel.findByIdAndUpdate(dependent, { superior: newJob._id });
    // }
    return newJob;
  }

  async edit(id: string, job: UpdateJobDto) {
    const { nombre } = job;
    // ? FOR DEPENDENTS IN ORGCHAR
    // for (const dependent of dependents) {
    //   await this.jobModel.findByIdAndUpdate(dependent, { superior: id });
    // }
    return this.jobModel.findByIdAndUpdate(id, { nombre }, { new: true });
  }

  async getOrganization() {
    const data: organizationData[] = await this.jobModel.aggregate([
      {
        $match: { isRoot: true },
      },
      {
        $graphLookup: {
          from: 'cargos',
          startWith: '$_id',
          connectFromField: '_id',
          connectToField: 'superior',
          as: 'organigram',
        },
      },
    ]);
    for (const element of data) {
      const superiorOfficer = await this.officerModel.findOne({ cargo: element._id });
      element.officer = superiorOfficer;
      for (const [index, dependents] of element.organigram.entries()) {
        const dependentOfficer = await this.officerModel.findOne({ cargo: dependents._id });
        element.organigram[index].officer = dependentOfficer;
      }
    }
    return this.createOrgChartData(data);
  }
  createOrgChartData(data: organizationData[]) {
    const newData: orgChartData[] = data.map((el) => {
      const newOrganigram = el.organigram.map((item) => {
        return {
          id: item._id,
          pid: item.superior,
          name: this.createFullName(item.officer),
          img: this.createUrlImgOfficer(item.officer),
          title: item.nombre,
        };
      });
      return {
        name: el.nombre,
        data: [
          {
            id: el._id,
            name: this.createFullName(el.officer),
            img: this.createUrlImgOfficer(el.officer),
            title: el.nombre,
          },
          ...newOrganigram,
        ],
      };
    });
    return newData;
  }

  createFullName(officer: Officer | null): string {
    if (!officer) return 'Sin funcionario';
    return [officer.nombre, officer.paterno, officer.materno].filter(Boolean).join(' ');
  }
  createUrlImgOfficer(officer: Officer | null): string {
    if (!officer) return 'https://cdn.balkan.app/shared/empty-img-white.svg';
    // TODO =  CHANGE FOR IMG SAVE URl OFFICER
    return 'https://img.freepik.com/free-icon/user_318-159711.jpg';
  }
}
