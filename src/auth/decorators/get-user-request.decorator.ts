import { ExecutionContext, InternalServerErrorException, createParamDecorator } from '@nestjs/common';

// extract user nested by strategy method in request
export const GetUserRequest = createParamDecorator((propertyPath: string, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();
  const user = req['user'];
  if (!user) throw new InternalServerErrorException('User not found in request');
  return !propertyPath ? user : user[propertyPath];
});
