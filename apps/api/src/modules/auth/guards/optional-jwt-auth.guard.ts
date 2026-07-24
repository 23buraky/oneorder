import { ExecutionContext, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

// Same "jwt" strategy as JwtAuthGuard, but never rejects the request — it
// just leaves req.user undefined when there's no (or an invalid) token.
// Used by routes that behave differently for guests vs logged-in users
// (the cart) without requiring authentication outright.
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard("jwt") {
  handleRequest<TUser = unknown>(_err: unknown, user: TUser, _info: unknown, _context: ExecutionContext): TUser {
    return user;
  }
}
