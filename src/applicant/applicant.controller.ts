import { Body, Controller, Get, Post } from '@nestjs/common';
import { Public } from 'src/auth/decorators';
import { ApplicantService } from './applicant.service';
import { ApplicantQueryDto } from './dto/query.dto';

@Public()
@Controller('applicants')
export class ApplicantController {
  constructor(private applicantService: ApplicantService) {}
  
  @Post()
  query(@Body() data: ApplicantQueryDto) {
    return this.applicantService.search(data);
  }

  @Get()
  myfuntion() {
    return 'private';
  }
}
