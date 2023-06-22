import { Controller, Get, Injectable, ParseIntPipe, Query } from '@nestjs/common';
import { OfficerService } from '../services';

@Controller('officer')
export class OfficerController {
    constructor(private readonly officerService: OfficerService) { }
    @Get()
    async get(@Query('limit', ParseIntPipe) limit: number, @Query('offset', ParseIntPipe) offset: number) {
        return await this.officerService.get(limit, offset)
    }
}
