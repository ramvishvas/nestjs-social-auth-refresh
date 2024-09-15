import { PartialType, PickType } from '@nestjs/swagger';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

export class ForgotPasswordDto extends PartialType(
  PickType(CreateUserDto, ['email'] as const),
) {}
