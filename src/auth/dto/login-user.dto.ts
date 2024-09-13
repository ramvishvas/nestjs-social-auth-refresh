import { PartialType, PickType } from '@nestjs/mapped-types';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

export class LoginAuthDto extends PartialType(
  PickType(CreateUserDto, ['email', 'password'] as const),
) {}
