import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Document, FilterQuery } from 'mongoose';

import { CreatePublicationDto, UpdatePublicationDto } from './dtos/post.dto';
import { FilesService } from '../files/files.service';
import { Publication, PublicationPriority } from './schemas/publication.schema';
import { Account } from 'src/users/schemas';
import { PaginationParamsDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class PublicationsService {
  constructor(
    @InjectModel(Publication.name) private publicationModel: Model<Publication>,
    private fileService: FilesService,
  ) {}

  async create(publicationDto: CreatePublicationDto, user: Account) {
    const createdPublication = new this.publicationModel({
      ...publicationDto,
      user,
    });
    await createdPublication.save();
    await createdPublication.populate({
      path: 'user',
      select: 'funcionario',
      populate: {
        path: 'funcionario',
      },
    });
    return this._plainPublication(createdPublication);
  }

  async delete(id: string) {
    const deleted = await this.publicationModel.findByIdAndDelete(id);
    if (!deleted) throw new NotFoundException();
    await this.fileService.deleteFile(
      deleted.attachments.map(({ filename }) => filename),
      'posts',
    );
    return { message: 'Publicacion eliminada' };
  }

  async findByUser(userId: string, { limit, offset, term }: PaginationParamsDto) {
    const query: FilterQuery<Publication> = {
      user: userId,
      ...(term && { title: new RegExp(term, 'i') }),
    };
    const [publications, length] = await Promise.all([
      this.publicationModel
        .find(query)
        .populate({
          path: 'user',
          select: 'funcionario',
          populate: {
            path: 'funcionario',
          },
        })
        .skip(offset)
        .limit(limit)
        .sort({ _id: -1 })
        .lean(),
      this.publicationModel.count(query),
    ]);
    return {
      publications: publications.map((post) => this._plainPublication(post)),
      length,
    };
  }

  async findAll({ limit, offset }: PaginationParamsDto) {
    const posts = await this.publicationModel
      .find({})
      .populate({
        path: 'user',
        select: 'funcionario',
        populate: {
          path: 'funcionario',
        },
      })
      .skip(offset)
      .limit(limit)
      .sort({ _id: -1 });
    return posts.map((post) => this._plainPublication(post));
  }

  async getNews({ limit, offset }: PaginationParamsDto) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const news = await this.publicationModel
      .find({
        priority: { $ne: PublicationPriority.Low },
        expirationDate: { $gte: today },
      })
      .populate({
        path: 'user',
        populate: {
          path: 'funcionario',
          select: 'nombre paterno materno',
        },
      })
      .skip(offset)
      .limit(limit)
      .sort({ _id: -1, priority: -1 });
    return news.map((publication) => this._plainPublication(publication));
  }

  private _plainPublication(publication: Publication) {
    if (publication instanceof Document) {
      publication = publication.toObject();
    }
    const { attachments, ...props } = publication;
    return {
      attachments: attachments.map((file) => ({
        title: file.title,
        filename: this.fileService.buildFileUrl(file.filename, 'post'),
      })),
      ...props,
    };
  }
}
