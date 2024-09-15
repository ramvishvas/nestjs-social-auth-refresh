import { IsStrongPassword, Matches, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Match } from 'src/library/decorators/match.decorator';

export class ChangePasswordDto {
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
  readonly oldPassword: string;

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
  readonly newPassword: string;

  @ApiProperty({
    example: 'P@sswOrd123!',
    description: 'The confirm password of the user',
  })
  @Match('newPassword', { message: 'Passwords do not match' })
  readonly confirmNewPassword: string;
}
