import { Module } from '@nestjs/common';
import { RefreshTokenService } from './refresh-token.service';
import { RefreshToken } from './entities/refresh-token.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HashingService } from 'src/library/services/hashing.service';

@Module({
  imports: [TypeOrmModule.forFeature([RefreshToken])],
  providers: [RefreshTokenService, HashingService],
  exports: [RefreshTokenService],
})
export class RefreshTokenModule {}
