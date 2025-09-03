import { Controller, Request, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtPayload } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { IUser } from 'src/user/interfaces/user.interface';

type LocalAuthRequest = Request & { user: IUser };
type AuthenticatedRequest = Request & { user: JwtPayload };

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(AuthGuard('local')) // 使用 'local' 策略的守卫
  @Post('login')
  login(@Request() req: LocalAuthRequest) {
    // AuthGuard('local') 会自动运行 LocalStrategy 的 validate 方法
    // 如果验证成功，用户信息会被附加到 req.user 上
    return this.authService.login(req.user);
  }

  // 这是一个受保护的路由，需要有效的JWT才能访问
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: AuthenticatedRequest) {
    return req.user; // req.user 来自 JwtStrategy 的 validate 方法的返回值
  }
}
