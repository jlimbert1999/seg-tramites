import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { Public } from 'src/auth/decorators';
import { ApplicantService } from './applicant.service';
import { ApplicantAuthenticacion } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('applicants')
export class ApplicantController {
  constructor(private applicantService: ApplicantService) {}
  @Post()
  @Public()
  login(@Body() data: ApplicantAuthenticacion) {
    return this.applicantService.login(data);
  }
  @Public()
  @UseGuards(AuthGuard('jwtapplicants'))
  @Get()
  myfuntion() {
    return 'private';
  }
}
