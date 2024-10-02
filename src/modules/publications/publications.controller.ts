import { Controller, Get, Post, Body, Query, Delete, Param } from '@nestjs/common';
import { PublicationsService } from './publications.service';
import { CreatePublicationDto } from './dtos/post.dto';

import { GetUserRequest, Public, ResourceProtected } from 'src/auth/decorators';
import { PublicationPriority } from './schemas/publication.schema';
import { GroupwareGateway } from 'src/groupware/groupware.gateway';
import { Account } from 'src/users/schemas';
import { PaginationParamsDto } from 'src/common/dto/pagination.dto';
import { VALID_RESOURCES } from 'src/auth/constants';

@Controller('posts')
@ResourceProtected(VALID_RESOURCES.publications)
export class PostsController {
  constructor(private readonly postsService: PublicationsService, private groupwareGateway: GroupwareGateway) {}

  @Post()
  async create(@Body() publicationDto: CreatePublicationDto, @GetUserRequest() user: Account) {
    const publication = await this.postsService.create(publicationDto, user);
    if (publication.priority === PublicationPriority.HIGH) {
      this.groupwareGateway.notifyNew(publication);
    }
    return publication;
  }

  @Get()
  @Public()
  findAll(@Query() params: PaginationParamsDto) {
    return this.postsService.findAll(params);
  }

  @Get('user')
  findByUser(@GetUserRequest() user: Account, @Query() pagination: PaginationParamsDto) {
    return this.postsService.findByUser(user._id, pagination);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.postsService.delete(id);
  }

  @Get('news')
  @Public()
  getNews(@Query() pagination: PaginationParamsDto) {
    return this.postsService.getNews(pagination);
  }
}
