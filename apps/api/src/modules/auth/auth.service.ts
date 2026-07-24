import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import type { User } from "@one-order/database";
import { PrismaService } from "../../database/prisma.service";
import { MailService } from "./mail/mail.service";
import { RegisterDto } from "./dto/register.dto";
import {
  BCRYPT_SALT_ROUNDS,
  EMAIL_VERIFICATION_EXPIRY_MS,
  EMAIL_VERIFICATION_TOKEN_BYTES,
  PASSWORD_RESET_EXPIRY_MS,
  PASSWORD_RESET_TOKEN_BYTES,
  REFRESH_TOKEN_BYTES,
} from "./constants/auth.constants";
import { generateOpaqueToken, hashToken } from "./utils/token.util";
import type {
  AuthResult,
  OAuthProfileInput,
  RequestMeta,
  UserResponse,
} from "./types/auth-result.type";
import type { AuthenticatedUser, JwtAccessPayload } from "./types/authenticated-user.type";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly mailService: MailService,
  ) {}

  async register(dto: RegisterDto, meta: RequestMeta): Promise<AuthResult> {
    const existing = await this.prisma.client.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException("An account with this email already exists");
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);
    const verificationToken = generateOpaqueToken(EMAIL_VERIFICATION_TOKEN_BYTES);

    const user = await this.prisma.client.user.create({
      data: {
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        marketingOptIn: dto.marketingOptIn ?? false,
        passwordHash,
        authProvider: "LOCAL",
        emailVerificationToken: hashToken(verificationToken),
        emailVerificationExpires: new Date(Date.now() + EMAIL_VERIFICATION_EXPIRY_MS),
      },
    });

    await this.mailService.sendVerificationEmail(user.email, user.firstName, verificationToken);

    return this.issueTokenPairForUser(user, meta);
  }

  async validateLocalUser(email: string, password: string): Promise<AuthenticatedUser> {
    const user = await this.prisma.client.user.findUnique({ where: { email } });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException("Invalid email or password");
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException("Invalid email or password");
    }

    return this.toAuthenticatedUser(user);
  }

  async login(user: AuthenticatedUser, meta: RequestMeta): Promise<AuthResult> {
    const fullUser = await this.prisma.client.user.findUniqueOrThrow({ where: { id: user.id } });
    return this.issueTokenPairForUser(fullUser, meta);
  }

  async validateOAuthLogin(profile: OAuthProfileInput, meta: RequestMeta): Promise<AuthResult> {
    let user = await this.prisma.client.user.findUnique({ where: { email: profile.email } });

    if (!user) {
      user = await this.prisma.client.user.create({
        data: {
          email: profile.email,
          firstName: profile.firstName,
          lastName: profile.lastName,
          avatarUrl: profile.avatarUrl,
          authProvider: profile.provider,
          providerId: profile.providerId,
          isEmailVerified: true, // the OAuth provider already verified ownership of the email
        },
      });
    } else if (user.authProvider === "LOCAL") {
      throw new ConflictException(
        "An account with this email already exists. Log in with your password instead.",
      );
    }

    return this.issueTokenPairForUser(user, meta);
  }

  async refreshTokens(refreshToken: string, meta: RequestMeta): Promise<AuthResult> {
    const tokenHash = hashToken(refreshToken);
    const stored = await this.prisma.client.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw new UnauthorizedException("Refresh token is invalid or expired");
    }

    // Rotate: revoke the used token and issue a fresh pair, so a stolen
    // refresh token can only be replayed once before it stops working.
    await this.prisma.client.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    return this.issueTokenPairForUser(stored.user, meta);
  }

  async logout(refreshToken: string): Promise<void> {
    const tokenHash = hashToken(refreshToken);
    await this.prisma.client.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async verifyEmail(token: string): Promise<void> {
    const tokenHash = hashToken(token);
    const user = await this.prisma.client.user.findUnique({
      where: { emailVerificationToken: tokenHash },
    });

    if (!user || !user.emailVerificationExpires || user.emailVerificationExpires < new Date()) {
      throw new BadRequestException("Verification link is invalid or has expired");
    }

    await this.prisma.client.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
      },
    });

    await this.mailService.sendWelcomeEmail(user.email, user.firstName);
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.prisma.client.user.findUnique({ where: { email } });

    // Always behave as if the email was sent — revealing whether an account
    // exists is a user-enumeration vector.
    if (!user || user.authProvider !== "LOCAL") {
      return;
    }

    const resetToken = generateOpaqueToken(PASSWORD_RESET_TOKEN_BYTES);
    await this.prisma.client.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: hashToken(resetToken),
        passwordResetExpires: new Date(Date.now() + PASSWORD_RESET_EXPIRY_MS),
      },
    });

    await this.mailService.sendPasswordResetEmail(user.email, user.firstName, resetToken);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const tokenHash = hashToken(token);
    const user = await this.prisma.client.user.findUnique({
      where: { passwordResetToken: tokenHash },
    });

    if (!user || !user.passwordResetExpires || user.passwordResetExpires < new Date()) {
      throw new BadRequestException("Reset link is invalid or has expired");
    }

    const passwordHash = await bcrypt.hash(newPassword, BCRYPT_SALT_ROUNDS);

    await this.prisma.client.$transaction([
      this.prisma.client.user.update({
        where: { id: user.id },
        data: {
          passwordHash,
          passwordResetToken: null,
          passwordResetExpires: null,
        },
      }),
      // Force re-login on every device once the password changes.
      this.prisma.client.refreshToken.updateMany({
        where: { userId: user.id, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);
  }

  private async issueTokenPairForUser(user: User, meta: RequestMeta): Promise<AuthResult> {
    const accessToken = this.signAccessToken(user);
    const refreshToken = await this.createRefreshToken(user.id, meta);

    return {
      accessToken,
      refreshToken,
      user: this.toUserResponse(user),
    };
  }

  private signAccessToken(user: User): string {
    const payload: JwtAccessPayload = { sub: user.id, email: user.email, role: user.role };
    return this.jwtService.sign(payload, {
      secret: this.config.get<string>("jwt.accessSecret"),
      expiresIn: this.config.get<string>("jwt.accessExpiresIn"),
    });
  }

  private async createRefreshToken(userId: string, meta: RequestMeta): Promise<string> {
    const refreshToken = generateOpaqueToken(REFRESH_TOKEN_BYTES);
    const refreshExpiresIn = this.config.get<string>("jwt.refreshExpiresIn") ?? "30d";

    await this.prisma.client.refreshToken.create({
      data: {
        userId,
        tokenHash: hashToken(refreshToken),
        deviceInfo: meta.userAgent,
        ipAddress: meta.ipAddress,
        expiresAt: new Date(Date.now() + parseDurationToMs(refreshExpiresIn)),
      },
    });

    return refreshToken;
  }

  private toAuthenticatedUser(user: User): AuthenticatedUser {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
    };
  }

  private toUserResponse(user: User): UserResponse {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      loyaltyPoints: user.loyaltyPoints,
      loyaltyLevel: user.loyaltyLevel,
    };
  }
}

// Parses simple duration strings ("15m", "30d", "1h") into milliseconds.
// Only used for the refresh token DB expiry — jsonwebtoken handles its own
// "expiresIn" parsing internally for the access token.
function parseDurationToMs(duration: string): number {
  const match = /^(\d+)([smhd])$/.exec(duration.trim());
  if (!match) {
    throw new Error(`Invalid duration format: "${duration}". Expected e.g. "15m", "30d".`);
  }

  const value = parseInt(match[1], 10);
  const unitMs: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return value * unitMs[match[2]];
}
