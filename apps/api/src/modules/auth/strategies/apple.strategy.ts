import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ConfigService } from "@nestjs/config";
import { Strategy } from "passport-apple";
import type { Request } from "express";
import type { OAuthProfileInput } from "../types/auth-result.type";

interface AppleIdTokenClaims {
  sub: string;
  email?: string;
}

type DoneCallback = (err: Error | null, user?: OAuthProfileInput) => void;

@Injectable()
export class AppleStrategy extends PassportStrategy(Strategy, "apple") {
  constructor(config: ConfigService) {
    super({
      clientID: config.get<string>("oauth.apple.clientId") || "not-configured",
      teamID: config.get<string>("oauth.apple.teamId") || "not-configured",
      keyID: config.get<string>("oauth.apple.keyId") || "not-configured",
      privateKeyString: config.get<string>("oauth.apple.privateKey") || undefined,
      callbackURL: config.get<string>("oauth.apple.callbackUrl"),
      scope: ["name", "email"],
      passReqToCallback: true,
    });
  }

  validate(
    req: Request,
    _accessToken: string,
    _refreshToken: string,
    idToken: AppleIdTokenClaims,
    done: DoneCallback,
  ): void {
    const email = idToken.email;

    if (!email) {
      done(new Error("Apple account has no email address"));
      return;
    }

    // Apple only includes the user's name in the initial authorization POST
    // body ("user" field), and only on the very first login — never again
    // on subsequent sign-ins. We fall back to placeholders after that.
    let firstName = "Apple";
    let lastName = "User";
    const rawUser = (req.body as { user?: string } | undefined)?.user;

    if (rawUser) {
      try {
        const parsed = JSON.parse(rawUser) as { name?: { firstName?: string; lastName?: string } };
        firstName = parsed.name?.firstName ?? firstName;
        lastName = parsed.name?.lastName ?? lastName;
      } catch {
        // malformed payload — keep placeholder names, the login itself still succeeds
      }
    }

    done(null, {
      provider: "APPLE",
      providerId: idToken.sub,
      email,
      firstName,
      lastName,
    });
  }
}
