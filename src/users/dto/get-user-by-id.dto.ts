import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt } from 'class-validator';

export class GetUserByIdDto {
  @ApiProperty({
    description: 'User ID',
    example: 1,
  })
  @IsInt()
  @Type(() => Number)
  readonly id: number;
}
