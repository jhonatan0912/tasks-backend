import { handleDBExceptions } from '@core/exceptions';
import { Response } from "@core/types";
import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcryptjs from 'bcryptjs';
import { Repository } from 'typeorm';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { User } from './entities/user.entity';
import { AuthResponseDto } from './dto/auth-response.dto';
import { JwtPayload } from '@core/interfaces';
import { JwtService } from '@nestjs/jwt';
import express from 'express';

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly jwtService: JwtService
  ) { }

  async register(registerDto: RegisterDto): Promise<Response<AuthResponseDto>> {
    try {
      const { password, ...rest } = registerDto;

      const user = this.usersRepository.create({
        password: bcryptjs.hashSync(password, 10),
        ...rest
      });

      const { password: _, ...data } = await this.usersRepository.save(user);

      return {
        data: {
          user: data,
          token: this.getJwtToken({ id: user.id }),
          refreshToken: this.getRefreshToken({ id: user.id })
        },
        message: 'Successfully registered'
      };
    } catch (error) {
      handleDBExceptions(error);
    }
  }

  async login(loginDto: LoginDto): Promise<Response<AuthResponseDto>> {
    try {
      const { email, password } = loginDto;

      const user = await this.usersRepository.findOne({ where: { email } });

      if (!user)
        throw new NotFoundException('User not found');

      const isMatch = bcryptjs.compareSync(password, user.password);

      if (!isMatch)
        throw new UnauthorizedException('Invalid credentials');

      const { password: _, ...data } = user;

      return {
        data: {
          user: data,
          token: this.getJwtToken({ id: user.id }),
          refreshToken: this.getRefreshToken({ id: user.id })
        },
        message: 'Successfully logged in'
      };
    } catch (error) {
      handleDBExceptions(error);
    }
  }

  async refreshToken({ token }: RefreshTokenDto): Promise<Response<AuthResponseDto>> {
    try {
      const { id } = await this.jwtService.verifyAsync(token);

      const user = await this.usersRepository.findOne({ where: { id } });

      if (!user)
        throw new BadRequestException('Invalid token');

      const { password: _, ...data } = user;

      return {
        data: {
          user: data,
          token: this.getJwtToken({ id: user.id }),
          refreshToken: this.getRefreshToken({ id: user.id })
        },
        message: 'Token refreshed successfully'
      };
    } catch (error) {
      handleDBExceptions(error);
    }
  }

  async getSession(id: string): Promise<Response<Partial<User>>> {
    try {
      const user = await this.usersRepository.findOne({ where: { id } });

      if (!user)
        throw new NotFoundException('User not found');

      const { password: _, ...data } = user;
      const { email, fullName } = data;

      return {
        data: {
          id,
          email,
          fullName
        },
        message: 'Session retrieved successfully'
      };
    } catch (error) {
      handleDBExceptions(error);
    }
  }

  async findUserById(id: string): Promise<Response<User>> {
    try {
      const user = await this.usersRepository.findOne({ where: { id } });

      if (!user)
        throw new NotFoundException('User not found');

      return {
        data: user,
        message: 'User retrieved successfully'
      };
    } catch (error) {
      handleDBExceptions(error);
    }
  }

  getJwtToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload);
  }

  getRefreshToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload, { expiresIn: '7d' });
  }

  setTokens(response: express.Response, authToken: string, refreshToken: string): void {
    try {
      response.cookie('auth_token', authToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'production',
        sameSite: 'lax',
      });
      response.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'production',
        sameSite: 'lax'
      });
    } catch (error) {
      throw new Error('Error setting tokens');
    }
  }
}
