import { Controller, Get } from '@nestjs/common';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ValidResources } from 'src/auth/interfaces/valid-resources.interface';

@Controller('account')
@Auth(ValidResources.CUENTAS)
export class AccountController {
    @Get()
    async myroute() {
        return {
            message: 'user in db',
        }
    }
}
