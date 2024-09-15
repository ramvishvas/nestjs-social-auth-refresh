import { PartialType, PickType } from '@nestjs/swagger';
import { ChangePasswordDto } from './change-password.dto';

export class ResetPasswordDto extends PartialType(
  PickType(ChangePasswordDto, ['newPassword', 'confirmNewPassword'] as const),
) {}
