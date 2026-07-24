import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { AuthenticatedUser } from "../../modules/auth/types/authenticated-user.type";

// Reads the user attached to the request by a Passport guard (JwtAuthGuard,
// LocalAuthGuard, ...). Pass a key to pluck a single field, e.g. @CurrentUser("id").
export const CurrentUser = createParamDecorator(
  (data: keyof AuthenticatedUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<{ user: AuthenticatedUser }>();
    return data ? request.user?.[data] : request.user;
  },
);
