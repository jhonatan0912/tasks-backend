import { IsEmail, IsString, IsStrongPassword, MinLength } from 'class-validator';

export class RegisterDto {

  @IsString()
  @MinLength(5)
  fullName: string;

  @IsEmail()
  email: string;

  @IsStrongPassword()
  password: string;
}