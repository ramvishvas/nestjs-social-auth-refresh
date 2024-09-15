import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { ITokenPayload } from '../interface/token-payload.interface';

export const TokenPayload = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request: Request = context.switchToHttp().getRequest();
    const authToken = request.cookies['Authentication']; // or use Authorization header if needed

    if (!authToken) {
      return null;
    }

    const jwtService = new JwtService({
      secret: process.env.JWT_ACCESS_TOKEN_SECRET,
    });
    const decodedToken = jwtService.decode(authToken) as ITokenPayload;

    return decodedToken;
  },
);
