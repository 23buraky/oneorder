import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ConfigService } from "@nestjs/config";
import { Strategy, Profile, VerifyCallback } from "passport-google-oauth20";
import type { OAuthProfileInput } from "../types/auth-result.type";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  constructor(config: ConfigService) {
    super({
      clientID: config.get<string>("oauth.google.clientId") || "not-configured",
      clientSecret: config.get<string>("oauth.google.clientSecret") || "not-configured",
      callbackURL: config.get<string>("oauth.google.callbackUrl"),
      scope: ["email", "profile"],
    });
  }

  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): void {
    const email = profile.emails?.[0]?.value;

    if (!email) {
      done(new Error("Google account has no public email address"), undefined);
      return;
    }

    const oAuthProfile: OAuthProfileInput = {
      provider: "GOOGLE",
      providerId: profile.id,
      email,
      firstName: profile.name?.givenName ?? profile.displayName,
      lastName: profile.name?.familyName ?? "",
      avatarUrl: profile.photos?.[0]?.value,
    };

    done(null, oAuthProfile);
  }
}
