import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePublicationDto } from './dtos/post.dto';
import { PaginationParamsDto } from 'src/common/dto/pagination.dto';
import { GetUserRequest } from 'src/auth/decorators';
import { Account } from 'src/users/schemas';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

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

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.postsService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
  //   return this.postsService.update(+id, updatePostDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.postsService.remove(+id);
  // }
}
