import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { ManyUsersService } from './many-users.service';
import { HashingService } from 'src/library/services/hashing.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService, ManyUsersService, HashingService],
  exports: [UsersService, HashingService],
})
export class UsersModule {}
