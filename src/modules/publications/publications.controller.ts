import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { PublicationsService } from './publications.service';
import { CreatePublicationDto } from './dtos/post.dto';
import { PaginationParamsDto } from 'src/common/dto/pagination.dto';
import { GetUserRequest } from 'src/auth/decorators';
import { PublicationPriority } from './schemas/publication.schema';
import { GroupwareGateway } from 'src/groupware/groupware.gateway';
import { User } from '../users/schemas';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PublicationsService,
    private groupwareGateway: GroupwareGateway,
  ) {}

  @Post()
  async create(
    @Body() publicationDto: CreatePublicationDto,
    @GetUserRequest() user: User,
  ) {
    const publication = await this.postsService.create(publicationDto, user);
    if (publication.priority === PublicationPriority.HIGH) {
      this.groupwareGateway.notifyNew(publication);
    }
    return publication;
  }

  @Get()
  findAll(@Query() params: PaginationParamsDto) {
    return this.postsService.findAll(params);
  }

  @Get('user')
  findByUser(
    @GetUserRequest() user: User,
    @Query() pagination: PaginationParamsDto,
  ) {
    return this.postsService.findByUser(user._id, pagination);
  }

  @Get('news')
  getNews(@Query() pagination: PaginationParamsDto) {
    return this.postsService.getNews(pagination);
  }
}
