import {
  ConflictException,
  Injectable,
  RequestTimeoutException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateManyUsersDto } from './dto/create-many-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class ManyUsersService {
  constructor(private readonly dataSource: DataSource) {}

  public async createMany(
    createManyUsersDto: CreateManyUsersDto,
  ): Promise<User[]> {
    // Ensure there are users to create
    if (!createManyUsersDto.users || createManyUsersDto.users.length === 0) {
      throw new ConflictException('No users provided for creation');
    }

    let newUsers: User[] = [];
    const queryRunner = this.dataSource.createQueryRunner();

    try {
      // Connect the query runner to the datasource
      await queryRunner.connect();
      // Start the transaction
      await queryRunner.startTransaction();
    } catch (error) {
      throw new RequestTimeoutException('Could not connect to the database', {
        description: String(error),
      });
    }

    try {
      // Create and save users in a batch for performance optimization
      const usersToCreate = createManyUsersDto.users.map((user) =>
        queryRunner.manager.create(User, user),
      );

      // Save all users in one operation
      newUsers = await queryRunner.manager.save(User, usersToCreate);

      // Commit the transaction
      await queryRunner.commitTransaction();
    } catch (error) {
      // Rollback transaction in case of an error
      await queryRunner.rollbackTransaction();
      throw new ConflictException('Could not complete the transaction', {
        description: String(error),
      });
    } finally {
      // Release the query runner
      try {
        await queryRunner.release();
      } catch (error) {
        throw new RequestTimeoutException(
          'Could not release the query runner connection',
          { description: String(error) },
        );
      }
    }

    return newUsers;
  }
}
