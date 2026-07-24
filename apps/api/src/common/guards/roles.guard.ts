import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { UserRole } from "@one-order/database";
import { ROLES_KEY } from "../decorators/roles.decorator";
import type { AuthenticatedUser } from "../../modules/auth/types/authenticated-user.type";

// Runs after a JwtAuthGuard has already populated request.user; only checks
// role membership, so always pair it with @UseGuards(JwtAuthGuard, RolesGuard).
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest<{ user: AuthenticatedUser }>();

    if (!user || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException("You do not have permission to access this resource");
    }

    return true;
  }
}
