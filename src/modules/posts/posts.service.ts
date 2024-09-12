import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Document } from 'mongoose';

import { CreatePublicationDto } from './dtos/post.dto';
import { Publication } from './schemas/post.schema';
import { FilesService } from '../files/files.service';
import { PaginationParamsDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Publication.name) private publicationModel: Model<Publication>,
    private fileService: FilesService,
  ) {}

  async create(publicationDto: CreatePublicationDto) {
    const createdPublications = new this.publicationModel(publicationDto);
    await createdPublications.save();
    return this._plainPublication(createdPublications);
  }

  async findAll({ limit, offset }: PaginationParamsDto) {
    const [publications, length] = await Promise.all([
      this.publicationModel
        .find({})
        .skip(offset)
        .limit(limit)
        .sort({ _id: -1 }),
      this.publicationModel.count({}),
    ]);
    return { publications, length };
  }

  private _plainPublication(publication: Publication) {
    if (publication instanceof Document) {
      publication = publication.toObject();
    }
    const { files, ...props } = publication;
    return {
      files: files.map((file) => this.fileService.buildFileUrl(file, 'posts')),
      ...props,
    };
  }
}
