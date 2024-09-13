import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { Response } from 'express';
import { TokenPayload } from './interface/token-payload.interface';
import { LoginAuthDto } from './dto/login-user.dto';
import { RefreshTokenService } from 'src/refresh-token/refresh-token.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  private getExpirationDate(expiresInMs: string): Date {
    const expires = new Date();
    expires.setMilliseconds(expires.getTime() + parseInt(expiresInMs, 10));
    return expires;
  }

  private setCookie(
    response: Response,
    name: string,
    value: string,
    expires: Date,
  ): void {
    response.cookie(name, value, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      expires: expires,
      sameSite: 'lax', // Use 'lax' for CSRF protection, adjust if needed
    });
  }

  async login(loginAuthDto: LoginAuthDto, response: Response) {
    const expiresAccessToken = this.getExpirationDate(
      this.configService.getOrThrow<string>('JWT_ACCESS_TOKEN_EXPIRATION_MS'),
    );

    const expiresRefreshToken = this.getExpirationDate(
      this.configService.getOrThrow<string>('JWT_REFRESH_TOKEN_EXPIRATION_MS'),
    );

    const user = await this.usersService.findOneByEmail(loginAuthDto.email);

    if (!user) {
      throw new UnauthorizedException('Credentials are not valid.');
    }

    const tokenPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
    };

    const accessToken = this.jwtService.sign(tokenPayload, {
      secret: this.configService.getOrThrow('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: `${this.configService.getOrThrow(
        'JWT_ACCESS_TOKEN_EXPIRATION_MS',
      )}ms`,
    });

    const refreshToken = this.jwtService.sign(tokenPayload, {
      secret: this.configService.getOrThrow('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: `${this.configService.getOrThrow(
        'JWT_REFRESH_TOKEN_EXPIRATION_MS',
      )}ms`,
    });

    // Ensure there's only one refresh token per session or device, or create new
    await this.refreshTokenService.createOrUpdate(
      user.id,
      refreshToken,
      expiresRefreshToken,
    );

    // Set access token in cookie
    this.setCookie(response, 'Authentication', accessToken, expiresAccessToken);

    // Set refresh token in cookie
    this.setCookie(response, 'Refresh', refreshToken, expiresRefreshToken);

    return user;
  }

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) {
      throw new UnauthorizedException('User not found.');
    }

    const authenticated = await compare(password, user.password);
    if (!authenticated) {
      throw new UnauthorizedException('Invalid password.');
    }

    return user;
  }

  async verifyUserRefreshToken(refreshToken: string, userId: number) {
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new UnauthorizedException('User not found.');
    }

    const storedRefreshTokens = await this.refreshTokenService.findByUserId(
      user.id,
    );

    if (!storedRefreshTokens || storedRefreshTokens.length === 0) {
      throw new UnauthorizedException('Refresh token not found.');
    }

    // Find the correct refresh token (useful when handling multiple tokens)
    const validRefreshToken = storedRefreshTokens.find((token) =>
      compare(refreshToken, token.refreshToken),
    );

    if (!validRefreshToken) {
      throw new UnauthorizedException('Invalid refresh token.');
    }

    return user;
  }
}
