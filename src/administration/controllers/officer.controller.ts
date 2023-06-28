import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { OfficerService } from '../services';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateOfficerDto } from '../dto/create-officer.dto';

@Controller('officer')
export class OfficerController {
    constructor(
        private readonly officerService: OfficerService,

    ) { }

    @Get('search/:text')
    async search(
        @Query('limit', ParseIntPipe) limit: number,
        @Query('offset', ParseIntPipe) offset: number,
        @Param('text') text: string) {
        return await this.officerService.search(limit, offset, text)
    }

    @Get()
    async get(@Query('limit', ParseIntPipe) limit: number, @Query('offset', ParseIntPipe) offset: number) {
        return await this.officerService.get(limit, offset)
    }

    @Post()
    @UseInterceptors(FileInterceptor('image'))
    async add(@Body() body: CreateOfficerDto, @UploadedFile() file: Express.Multer.File) {
        return this.officerService.add(body, file)
    }



}
