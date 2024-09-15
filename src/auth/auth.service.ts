import { InMemoryCacheService } from './../library/services/in-memory-cache.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { MailService } from './mail.service';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { Response } from 'express';
import { ITokenPayload } from './interface/token-payload.interface';
import { LoginAuthDto } from './dto/login-user.dto';
import { RefreshTokenService } from 'src/refresh-token/refresh-token.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ICurrentUser } from './interface/current-user.interface';
import { HashingService } from 'src/library/services/hashing.service';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly mailService: MailService,
    private readonly hashingService: HashingService,
    private readonly inMemoryCacheService: InMemoryCacheService,
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

    const tokenPayload: ITokenPayload = {
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

    const authenticated = await this.hashingService.compare(
      password,
      user.password,
    );
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
      this.hashingService.compare(refreshToken, token.refreshToken),
    );

    if (!validRefreshToken) {
      throw new UnauthorizedException('Invalid refresh token.');
    }

    return user;
  }

  async signup(createUserDto: CreateUserDto) {
    const newUser = await this.usersService.create(createUserDto);
    if (!newUser) {
      throw new InternalServerErrorException('User not created.');
    }

    // Send welcome email
    await this.mailService.sendWelcomeEmail(newUser.email);

    // Sent verification email
    const tokenPayload: ITokenPayload = {
      userId: newUser.id,
      email: newUser.email,
    };

    const emailVerificationToken = this.jwtService.sign(tokenPayload, {
      secret: this.configService.getOrThrow('JWT_EMAIL_SECRET'),
    });

    await this.mailService.sendVerificationEmail(
      newUser.email,
      emailVerificationToken,
    );

    return newUser;
  }

  async verifyEmail(token: string) {
    const decodedToken = this.jwtService.decode(token) as ITokenPayload;
    if (!decodedToken) {
      throw new UnauthorizedException('Invalid token.');
    }

    const user = await this.usersService.findOne(decodedToken.userId);
    if (!user) {
      throw new UnauthorizedException('User not found.');
    }

    // Verify email
    user.isEmailConfirmed = new Date();
    await this.usersService.update(user.id, user);

    return user;
  }

  async changePassword(
    changePasswordDto: ChangePasswordDto,
    currentUser: ICurrentUser,
  ) {
    if (!currentUser) {
      throw new UnauthorizedException('User not found.');
    }

    const authenticated = await this.hashingService.compare(
      changePasswordDto.oldPassword,
      currentUser.password,
    );

    if (!authenticated) {
      throw new UnauthorizedException('Invalid password.');
    }

    // Compare old password with the user's current password
    if (changePasswordDto.oldPassword === changePasswordDto.newPassword) {
      throw new BadRequestException(
        'New password cannot be the same as the old password.',
      );
    }

    await this.usersService.updatePassword(
      currentUser.id,
      changePasswordDto.newPassword,
    );

    return { message: 'Password changed successfully.' };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;

    // Validate email format if needed
    if (!email) {
      throw new BadRequestException('Email is required.');
    }

    // Find user by email
    const user = await this.usersService.findOneByEmail(email);

    if (!user) {
      throw new NotFoundException(
        'User with this email address does not exist.',
      );
    }

    // Generate a password reset token
    const tokenPayload: ITokenPayload = {
      userId: user.id,
      email: user.email,
    };

    const resetToken = this.jwtService.sign(tokenPayload, {
      secret: this.configService.getOrThrow('JWT_EMAIL_SECRET'),
    });

    const hashedResetToken = await this.hashingService.hash(resetToken);

    // Store the reset token in memory
    this.inMemoryCacheService.setWithExpiration(hashedResetToken, resetToken);

    // Send the password reset email
    try {
      await this.mailService.sendPasswordResetEmail(email, hashedResetToken);
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw new BadRequestException('Error sending password reset email.');
    }

    return { message: 'Password reset email sent successfully.' };
  }

  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
    hashedResetToken: string,
  ) {
    // Validate token
    const resetToken = this.inMemoryCacheService.get(hashedResetToken);

    if (!resetToken) {
      throw new BadRequestException('Token is invalid or expired.');
    }

    try {
      // Verify and decode the token
      const decodedToken = this.jwtService.verify(resetToken) as ITokenPayload;

      // Find user by id
      const user = await this.usersService.findOne(decodedToken.userId);
      if (!user) {
        throw new BadRequestException('User not found.');
      }

      // Update user's password
      await this.usersService.updatePassword(
        decodedToken.userId,
        resetPasswordDto.newPassword,
      );

      // Cleanup the token from in-memory cache
      this.inMemoryCacheService.delete(hashedResetToken);

      return { message: 'Password reset successfully.' };
    } catch (error) {
      // Handle JWT verification errors
      throw new BadRequestException('Token is invalid or expired.');
    }
  }
}
