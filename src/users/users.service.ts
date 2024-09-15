import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FilterUserDto } from './dto/filter-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { HashingService } from 'src/library/services/hashing.service';

/**
 * The UsersService class is a service that provides methods to manage users.
 */
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly hashService: HashingService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const password = await this.hashService.hash(createUserDto.password);
    const user = this.userRepository.create({
      ...createUserDto,
      password,
    });
    return this.userRepository.save(user);
  }

  findAll(
    limit: number,
    page: number,
    sort: string,
    order: string,
    filters?: FilterUserDto,
  ) {
    return this.userRepository.find({
      take: limit,
      skip: (page - 1) * limit,
      order: {
        [sort]: order.toUpperCase(),
      },
      where: filters,
    });
  }

  findOne(id: number): Promise<User> {
    return this.userRepository.findOneBy({ id });
  }

  findOneByEmail(email: string) {
    return this.userRepository.findOne({ where: { email } });
  }

  update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    return this.userRepository.save({
      id,
      ...updateUserDto,
    });
  }

  updatePartial(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    return this.userRepository.save({
      id,
      ...updateUserDto,
    });
  }

  async updatePassword(id: number, newPassword: string): Promise<User> {
    const hashedPassword = await this.hashService.hash(newPassword);
    return this.userRepository.save({
      id,
      password: hashedPassword,
    });
  }

  remove(id: number) {
    return this.userRepository.delete({ id });
  }
}
