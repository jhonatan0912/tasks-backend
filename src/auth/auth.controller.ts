import { Body, Controller, Get, Post, Request, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { User } from './entities/user.entity';
import { AuthGuard } from '@core/guards/auth.guard';
import { Response } from 'express';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {

  constructor(private readonly authService: AuthService) { }

  @Post('register')
  async register(@Body() registerDto: RegisterDto, @Res({ passthrough: true }) response: Response) {
    const res = await this.authService.register(registerDto);
    this.authService.setTokens(response, res.data.token, res.data.refreshToken);

    return res;
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) response: Response) {
    const res = await this.authService.login(loginDto);
    this.authService.setTokens(response, res.data.token, res.data.refreshToken);

    return res;
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) response: Response) {
    return this.authService.logout(response);
  }

  @Post('refresh-token')
  refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto);
  }

  @Get('session')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  getSession(@Request() req: Request) {
    const { id } = req['user'] as User;

    return this.authService.getSession(id);
  }
}
