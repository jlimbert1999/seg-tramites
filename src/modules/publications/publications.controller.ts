import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { PublicationsService } from './publications.service';
import { CreatePublicationDto } from './dtos/post.dto';
import { PaginationParamsDto } from 'src/common/dto/pagination.dto';
import { GetUserRequest } from 'src/auth/decorators';
import { Account } from 'src/users/schemas';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PublicationsService) {}

  @Post()
  create(
    @Body() publicationDto: CreatePublicationDto,
    @GetUserRequest() user: Account,
  ) {
    return this.postsService.create(publicationDto, user);
  }

  @Get()
  findAll(@Query() params: PaginationParamsDto) {
    return this.postsService.findAll(params);
  }

  @Get('user')
  findByUser(
    @GetUserRequest() user: Account,
    @Query() pagination: PaginationParamsDto,
  ) {
    return this.postsService.findByUser(user._id, pagination);
  }

  @Get('news')
  getNews(@Query() pagination: PaginationParamsDto) {
    return this.postsService.getNews(pagination);
  }
}
