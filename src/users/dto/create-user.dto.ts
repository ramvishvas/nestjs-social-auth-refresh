import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { RolesEnum } from '../enums/roles.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Match } from 'src/library/decorators/match.decorator';

export class CreateUserDto {
  @ApiPropertyOptional({
    example: 'John Doe',
    description: 'The name of the user',
  })
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(255)
  readonly name?: string;

  @ApiProperty({
    example: 'ram@gmail.com',
    description: 'The email of the user',
  })
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  readonly email: string;

  @ApiProperty({
    example: 'P@sswOrd123!',
    description: 'The password of the user',
  })
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  @MaxLength(255)
  @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.*\s).{8,255}$/, {
    message: 'Password is too weak',
  })
  readonly password: string;

  @ApiProperty({
    example: 'P@sswOrd123!',
    description: 'The confirm password of the user',
  })
  @Match('password', { message: 'Passwords do not match' })
  readonly confirmPassword: string;

  @ApiPropertyOptional({
    example: 'user',
    description: 'The role of the user',
    enum: RolesEnum,
  })
  @IsEnum(RolesEnum, { message: 'Invalid role' })
  @IsOptional()
  readonly role?: RolesEnum;
}
