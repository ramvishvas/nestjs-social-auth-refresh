import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { RefreshTokenModule } from 'src/refresh-token/refresh-token.module';
import { MailService } from './mail.service';
import { InMemoryCacheService } from 'src/library/services/in-memory-cache.service';

@Module({
  imports: [UsersModule, PassportModule, JwtModule, RefreshTokenModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    JwtRefreshStrategy,
    MailService,
    InMemoryCacheService,
  ],
})
export class AuthModule {}
