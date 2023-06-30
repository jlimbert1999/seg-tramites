import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { OfficerService } from '../services';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateOfficerDto } from '../dto/create-officer.dto';
import { UpdateOfficerDto } from '../dto/update-officer.dto';

@Controller('officer')
export class OfficerController {z
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

    @Put('/:id')
    async edit(
        @Param('id') id_officer: string,
        @Body() officer: UpdateOfficerDto) {
        return await this.officerService.edit(id_officer, officer)
    }



}
