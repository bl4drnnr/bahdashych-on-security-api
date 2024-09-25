import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const TrxDecorator = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.transaction;
  }
);
