import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Document } from 'mongoose';

import { CreatePublicationDto } from './dtos/post.dto';
import { Publication } from './schemas/post.schema';
import { FilesService } from '../files/files.service';
import { PaginationParamsDto } from 'src/common/dto/pagination.dto';
import { Account } from 'src/users/schemas';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Publication.name) private publicationModel: Model<Publication>,
    private fileService: FilesService,
  ) {}

  async create(publicationDto: CreatePublicationDto, user: Account) {
    const createdPublications = new this.publicationModel({
      ...publicationDto,
      user,
    });
    await createdPublications.save();
    return this._plainPublication(createdPublications);
  }

  async findAll({ limit, offset }: PaginationParamsDto) {
    return await this.publicationModel
      .find({})
      .skip(offset)
      .limit(limit)
      .sort({ _id: -1 });
  }

  private _plainPublication(publication: Publication) {
    if (publication instanceof Document) {
      publication = publication.toObject();
    }
    const { attachments, ...props } = publication;
    return {
      attachments: attachments.map((file) => ({
        title: file.title,
        filename: this.fileService.buildFileUrl(file.filename, 'posts'),
      })),
      ...props,
    };
  }
}
