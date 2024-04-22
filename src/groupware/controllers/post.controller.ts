import { Body, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { fileFilter, fileNamer } from 'src/files/helpers';

@Controller()
export class PostController {
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: fileFilter,
      storage: diskStorage({
        destination: './static/posts',
        filename: fileNamer,
      }),
    }),
  )
  create(@Body() body: any, @UploadedFile() file: Express.Multer.File) {
  }
}
