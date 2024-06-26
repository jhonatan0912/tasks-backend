import { AuthService } from '@auth/auth.service';
import { handleDBExceptions } from '@core/exceptions';
import { JwtPayload } from '@core/interfaces';
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class AuthGuard implements CanActivate {

  constructor(
    private readonly jwtService: JwtService,
    private readonly authService: AuthService
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    if (!token)
      throw new UnauthorizedException('There is no bearer token');

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, { secret: process.env.JWT_SECRET });

      const user = await this.authService.findUserById(payload.id);

      if (!user) throw new UnauthorizedException('User not found');

      request['user'] = user.data;
    } catch (error) {
      handleDBExceptions(error);
    }

    return Promise.resolve(true);
  }

  private extractToken(request: any): string | undefined {
    const cookie = request.cookies['auth_token'];
    return cookie ? cookie : undefined;
  }
}