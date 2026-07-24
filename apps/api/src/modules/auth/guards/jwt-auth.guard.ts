import { ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  handleRequest<TUser = unknown>(err: unknown, user: TUser, info: unknown, _context: ExecutionContext): TUser {
    if (err || !user) {
      const reason = info instanceof Error ? info.message : "Unauthorized";
      throw new UnauthorizedException(reason);
    }
    return user;
  }
}
