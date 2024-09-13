import { IsEnum, IsOptional } from 'class-validator';
import { FilterUserDto } from './filter-user.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from 'src/library/dto/pagination-query.dto';

enum SortFields {
  CREATED_AT = 'createdAt',
  NAME = 'name',
  EMAIL = 'email',
}

export class GetUsersDto extends PaginationQueryDto<FilterUserDto> {
  @ApiPropertyOptional({
    enum: SortFields,
    description: 'Sort by field',
    default: SortFields.CREATED_AT,
  })
  @IsOptional()
  @IsEnum(SortFields)
  sort?: SortFields = SortFields.CREATED_AT;
}
