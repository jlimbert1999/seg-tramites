import { UseGuards, applyDecorators } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RoleProtected } from './rol-protected.decorator';
import { ValidResources } from '../interfaces/valid-resources.interface';
import { AccountRoleGuard } from '../guards/account-role/account-role.guard';


export function Auth(resource?: ValidResources) {
    return applyDecorators(
        RoleProtected(resource),
        UseGuards(AuthGuard(), AccountRoleGuard)
    );
}