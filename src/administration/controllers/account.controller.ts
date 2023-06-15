import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ValidResources } from 'src/auth/interfaces/valid-resources.interface';
import { AccountService } from '../services/account.service';

@Controller('account')
@Auth(ValidResources.CUENTAS)
export class AccountController {
    constructor(private readonly accountService: AccountService) {

    }
    @Get()
    async findAll(@Query('limit', ParseIntPipe) limit: number, @Query('offset', ParseIntPipe) offset: number) {
        return await this.accountService.findAll(limit, offset)
    }
}
