import { RolesEnum } from 'src/users/enums/roles.enum';

export interface ICurrentUser {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null; // nullable if soft deletes are being used
  name: string;
  email: string;
  password: string;
  role: RolesEnum;
  isEmailConfirmed: Date | null;
}
