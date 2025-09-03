import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, Role } from '../decorators/roles.decorator';
import { JwtPayload } from '../strategies/jwt.strategy';

type AuthenticatedRequest = Request & { user: JwtPayload };

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. 获取路由处理函数上定义的角色元数据
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // 如果没有定义角色要求，则默认允许访问
    if (!requiredRoles) {
      return true;
    }

    // 2. 获取当前请求的用户信息 (由 JwtAuthGuard 添加)
    const { user } = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!user || !user.roles) {
      return false; // 如果没有用户信息或角色信息，则拒绝访问
    }

    // 3. 判断用户角色是否至少匹配一个所需角色
    return requiredRoles.some((role) => user.roles?.includes(role));
  }
}
