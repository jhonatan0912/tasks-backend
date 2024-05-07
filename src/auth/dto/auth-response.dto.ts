import { User } from '@auth/entities/user.entity';

export class AuthResponseDto {
  user: Partial<User>;
  token: string;
  refreshToken: string;
}