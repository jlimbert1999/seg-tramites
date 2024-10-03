import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Document, FilterQuery } from 'mongoose';

import { Publication, PublicationPriority } from './schemas/publication.schema';
import { CreatePublicationDto, UpdatePublicationDto } from './dtos/post.dto';
import { PaginationParamsDto } from 'src/common/dto/pagination.dto';
import { FilesService } from '../files/files.service';
import { Account } from 'src/users/schemas';

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

  async update(id: string, publicationDto: UpdatePublicationDto) {
    console.log(publicationDto);
    const document = await this.publicationModel.findById(id);
    if (!document) {
      throw new BadRequestException(`Publication ${id} don't exist`);
    }
    let filesToDelete: string[] = [];
    if (publicationDto.attachments) {
      const savedFiles = document.attachments.map(({ filename }) => filename);
      const newFiles = publicationDto.attachments.map(({ filename }) => filename);
      filesToDelete = savedFiles.filter((file) => !newFiles.includes(file));
    }
    const { image } = publicationDto;
    if (image !== undefined && document.image && image !== document.image) {
      filesToDelete.push(document.image);
    }
    const updated = await this.publicationModel.findByIdAndUpdate(
      id,
      { ...publicationDto, ...(image === '' && { image: null }) },
      { new: true },
    );
    await this.fileService.deleteFiles(filesToDelete, 'posts');
    return this._plainPublication(updated);
  }

  async delete(id: string) {
    const deleted = await this.publicationModel.findByIdAndDelete(id);
    if (!deleted) throw new NotFoundException();
    await this.fileService.deleteFiles(
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
        startDate: { $lte: today },
        // <=
        expirationDate: { $gte: today },
        // >=
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
    const { attachments, image, ...props } = publication;
    return {
      image: image ? this.fileService.buildFileUrl(image, 'post') : null,
      attachments: attachments.map((file) => ({
        title: file.title,
        filename: this.fileService.buildFileUrl(file.filename, 'post'),
      })),
      ...props,
    };
  }
}
