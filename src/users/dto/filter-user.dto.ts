import { PartialType, PickType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

export class FilterUserDto extends PartialType(
  PickType(CreateUserDto, ['role'] as const),
) {}
