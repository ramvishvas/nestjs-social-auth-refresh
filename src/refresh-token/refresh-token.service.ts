import { Injectable } from '@nestjs/common';
import { CreateRefreshTokenDto } from './dto/create-refresh-token.dto';
import { UpdateRefreshTokenDto } from './dto/update-refresh-token.dto';
import { RefreshToken } from './entities/refresh-token.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { hash } from 'bcryptjs';

@Injectable()
export class RefreshTokenService {
  constructor(
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  async create(
    createRefreshTokenDto: CreateRefreshTokenDto,
  ): Promise<RefreshToken> {
    const refreshToken = this.refreshTokenRepository.create(
      createRefreshTokenDto,
    );
    return this.refreshTokenRepository.save(refreshToken);
  }

  async createOrUpdate(
    userId: number,
    token: string,
    expiresAt: Date,
  ): Promise<RefreshToken> {
    const existingTokens = await this.findByUserId(userId);

    const hashedToken = await hash(token, 10); // Hash the refresh token before storing it

    if (existingTokens && existingTokens.length > 0) {
      // If a refresh token exists, update the first one found
      const refreshToken = existingTokens[0];
      refreshToken.refreshToken = hashedToken;
      refreshToken.expiresAt = expiresAt;

      return this.refreshTokenRepository.save(refreshToken); // Update the existing refresh token
    } else {
      // If no refresh token exists, create a new one
      const newRefreshToken = this.refreshTokenRepository.create({
        user: { id: userId },
        refreshToken: hashedToken,
        expiresAt,
      });

      return this.refreshTokenRepository.save(newRefreshToken); // Save the new refresh token
    }
  }

  findByUserId(userId: number): Promise<RefreshToken[]> {
    return this.refreshTokenRepository.find({
      where: { user: { id: userId } },
    });
  }

  update(
    id: number,
    updateRefreshTokenDto: UpdateRefreshTokenDto,
  ): Promise<RefreshToken> {
    return this.refreshTokenRepository.save({
      id,
      ...updateRefreshTokenDto,
    });
  }

  remove(id: number) {
    return this.refreshTokenRepository.delete({ id });
  }
}
