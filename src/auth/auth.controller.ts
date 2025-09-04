import {
  Controller,
  Request,
  Get,
  Post,
  UseGuards,
  Body,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtPayload } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { IUser, SafeUser } from 'src/user/interfaces/user.interface';
import { ApiBody, ApiSecurity } from '@nestjs/swagger';
import { CreateUserDto } from 'src/user/dto/create-user.dto';

type LocalAuthRequest = Request & { user: IUser };
type AuthenticatedRequest = Request & { user: JwtPayload };

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiBody({
    type: [CreateUserDto],
    examples: {
      example1: {
        value: {
          email: 'jane@example.com',
          fullName: 'Jane Doe',
          password: '123456',
        },
      },
    },
  })
  async register(@Body() dto: CreateUserDto): Promise<SafeUser> {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiSecurity('basic-auth')
  @UseGuards(AuthGuard('local')) // 使用 'local' 策略的守卫
  login(@Request() req: LocalAuthRequest) {
    // AuthGuard('local') 会自动运行 LocalStrategy 的 validate 方法
    // 如果验证成功，用户信息会被附加到 req.user 上
    return this.authService.login(req.user);
  }

  // 这是一个受保护的路由，需要有效的JWT才能访问
  @Get('profile')
  @ApiSecurity('jwt')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req: AuthenticatedRequest) {
    return req.user; // req.user 来自 JwtStrategy 的 validate 方法的返回值
  }
}
