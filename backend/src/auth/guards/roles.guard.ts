import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    console.log('[RolesGuard] requiredRoles:', requiredRoles);
    console.log('[RolesGuard] user:', user);
    if (!user) {
      console.log('[RolesGuard] No user found in request!');
      return false;
    }
    const hasRole = requiredRoles.includes(user.role);
    console.log('[RolesGuard] hasRole:', hasRole);
    return hasRole;
  }
}
