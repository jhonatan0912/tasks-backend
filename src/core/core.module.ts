import { AuthModule } from '@auth/auth.module';
import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AuthGuard } from './guards/auth.guard';

@Module({
  imports: [
    AuthModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: '1d',
      }
    })
  ],
  providers: [AuthGuard, JwtService],
  exports: [AuthGuard]
})
export class CoreModule { }
