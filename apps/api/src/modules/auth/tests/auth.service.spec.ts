import { ConflictException, UnauthorizedException, BadRequestException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { AuthService } from "../auth.service";
import { PrismaService } from "../../../database/prisma.service";
import { MailService } from "../mail/mail.service";
import { hashToken } from "../utils/token.util";

describe("AuthService", () => {
  let authService: AuthService;
  let prisma: {
    client: {
      user: {
        findUnique: jest.Mock;
        findUniqueOrThrow: jest.Mock;
        create: jest.Mock;
        update: jest.Mock;
      };
      refreshToken: {
        findUnique: jest.Mock;
        create: jest.Mock;
        update: jest.Mock;
        updateMany: jest.Mock;
      };
      $transaction: jest.Mock;
    };
  };
  let mailService: { sendVerificationEmail: jest.Mock; sendWelcomeEmail: jest.Mock; sendPasswordResetEmail: jest.Mock };

  const baseUser = {
    id: "user_1",
    email: "sofia@example.com",
    firstName: "Sofia",
    lastName: "De Vries",
    phone: null,
    passwordHash: null as string | null,
    authProvider: "LOCAL" as const,
    providerId: null,
    avatarUrl: null,
    preferredLocale: "NL" as const,
    marketingOptIn: false,
    role: "CUSTOMER" as const,
    isEmailVerified: false,
    emailVerificationToken: null as string | null,
    emailVerificationExpires: null as Date | null,
    passwordResetToken: null as string | null,
    passwordResetExpires: null as Date | null,
    loyaltyPoints: 0,
    loyaltyLevel: "BRONZE" as const,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    prisma = {
      client: {
        user: {
          findUnique: jest.fn(),
          findUniqueOrThrow: jest.fn(),
          create: jest.fn(),
          update: jest.fn(),
        },
        refreshToken: {
          findUnique: jest.fn(),
          create: jest.fn(),
          update: jest.fn(),
          updateMany: jest.fn(),
        },
        $transaction: jest.fn(),
      },
    };

    mailService = {
      sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
      sendWelcomeEmail: jest.fn().mockResolvedValue(undefined),
      sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
    };

    const config = {
      get: (key: string) => {
        const values: Record<string, string> = {
          "jwt.accessSecret": "test-access-secret",
          "jwt.accessExpiresIn": "15m",
          "jwt.refreshExpiresIn": "30d",
        };
        return values[key];
      },
    } as unknown as ConfigService;

    const jwtService = { sign: jest.fn().mockReturnValue("signed.jwt.token") } as unknown as JwtService;

    authService = new AuthService(
      prisma as unknown as PrismaService,
      jwtService,
      config,
      mailService as unknown as MailService,
    );
  });

  describe("register", () => {
    it("throws a conflict when the email is already taken", async () => {
      prisma.client.user.findUnique.mockResolvedValue(baseUser);

      await expect(
        authService.register(
          { email: baseUser.email, firstName: "Sofia", lastName: "De Vries", password: "Str0ngPass1" },
          {},
        ),
      ).rejects.toThrow(ConflictException);
    });

    it("hashes the password, creates the user and sends a verification email", async () => {
      prisma.client.user.findUnique.mockResolvedValue(null);
      prisma.client.user.create.mockImplementation(({ data }) =>
        Promise.resolve({ ...baseUser, ...data, id: "user_new" }),
      );
      prisma.client.refreshToken.create.mockResolvedValue({});

      const result = await authService.register(
        { email: "new@example.com", firstName: "Nieuw", lastName: "Gebruiker", password: "Str0ngPass1" },
        { ipAddress: "127.0.0.1" },
      );

      expect(prisma.client.user.create).toHaveBeenCalledTimes(1);
      const createArgs = prisma.client.user.create.mock.calls[0][0];
      expect(createArgs.data.passwordHash).not.toBe("Str0ngPass1");
      expect(await bcrypt.compare("Str0ngPass1", createArgs.data.passwordHash)).toBe(true);
      expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(
        "new@example.com",
        "Nieuw",
        expect.any(String),
      );
      expect(result.accessToken).toBe("signed.jwt.token");
      expect(result.user.email).toBe("new@example.com");
    });
  });

  describe("validateLocalUser", () => {
    it("rejects when no user exists for the email", async () => {
      prisma.client.user.findUnique.mockResolvedValue(null);

      await expect(authService.validateLocalUser("nobody@example.com", "whatever")).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("rejects an OAuth-only account (no password set)", async () => {
      prisma.client.user.findUnique.mockResolvedValue({ ...baseUser, passwordHash: null });

      await expect(authService.validateLocalUser(baseUser.email, "whatever")).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("rejects an incorrect password", async () => {
      const passwordHash = await bcrypt.hash("correct-password", 4);
      prisma.client.user.findUnique.mockResolvedValue({ ...baseUser, passwordHash });

      await expect(authService.validateLocalUser(baseUser.email, "wrong-password")).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("returns a projected user on a correct password", async () => {
      const passwordHash = await bcrypt.hash("correct-password", 4);
      prisma.client.user.findUnique.mockResolvedValue({ ...baseUser, passwordHash });

      const user = await authService.validateLocalUser(baseUser.email, "correct-password");

      expect(user).toEqual({
        id: baseUser.id,
        email: baseUser.email,
        firstName: baseUser.firstName,
        lastName: baseUser.lastName,
        role: baseUser.role,
        isEmailVerified: baseUser.isEmailVerified,
      });
      expect((user as unknown as Record<string, unknown>).passwordHash).toBeUndefined();
    });
  });

  describe("refreshTokens", () => {
    it("rejects an unknown or expired refresh token", async () => {
      prisma.client.refreshToken.findUnique.mockResolvedValue(null);

      await expect(authService.refreshTokens("not-a-real-token", {})).rejects.toThrow(UnauthorizedException);
    });

    it("rotates a valid refresh token and revokes the old one", async () => {
      prisma.client.refreshToken.findUnique.mockResolvedValue({
        id: "rt_1",
        revokedAt: null,
        expiresAt: new Date(Date.now() + 1_000_000),
        user: baseUser,
      });
      prisma.client.refreshToken.update.mockResolvedValue({});
      prisma.client.refreshToken.create.mockResolvedValue({});

      await authService.refreshTokens("some-refresh-token", {});

      expect(prisma.client.refreshToken.update).toHaveBeenCalledWith({
        where: { id: "rt_1" },
        data: { revokedAt: expect.any(Date) },
      });
      expect(prisma.client.refreshToken.create).toHaveBeenCalledTimes(1);
    });
  });

  describe("verifyEmail", () => {
    it("rejects an invalid or expired token", async () => {
      prisma.client.user.findUnique.mockResolvedValue(null);

      await expect(authService.verifyEmail("bogus-token")).rejects.toThrow(BadRequestException);
    });

    it("marks the user verified and sends a welcome email", async () => {
      const token = "raw-verification-token";
      prisma.client.user.findUnique.mockResolvedValue({
        ...baseUser,
        emailVerificationToken: hashToken(token),
        emailVerificationExpires: new Date(Date.now() + 1_000_000),
      });
      prisma.client.user.update.mockResolvedValue({});

      await authService.verifyEmail(token);

      expect(prisma.client.user.update).toHaveBeenCalledWith({
        where: { id: baseUser.id },
        data: {
          isEmailVerified: true,
          emailVerificationToken: null,
          emailVerificationExpires: null,
        },
      });
      expect(mailService.sendWelcomeEmail).toHaveBeenCalledWith(baseUser.email, baseUser.firstName);
    });
  });

  describe("forgotPassword", () => {
    it("does nothing silently when the email does not exist (no user enumeration)", async () => {
      prisma.client.user.findUnique.mockResolvedValue(null);

      await authService.forgotPassword("nobody@example.com");

      expect(mailService.sendPasswordResetEmail).not.toHaveBeenCalled();
    });

    it("sends a reset email for an existing local account", async () => {
      prisma.client.user.findUnique.mockResolvedValue(baseUser);
      prisma.client.user.update.mockResolvedValue({});

      await authService.forgotPassword(baseUser.email);

      expect(mailService.sendPasswordResetEmail).toHaveBeenCalledWith(
        baseUser.email,
        baseUser.firstName,
        expect.any(String),
      );
    });
  });

  describe("resetPassword", () => {
    it("rejects an invalid or expired token", async () => {
      prisma.client.user.findUnique.mockResolvedValue(null);

      await expect(authService.resetPassword("bogus", "N3wPassw0rd")).rejects.toThrow(BadRequestException);
    });

    it("updates the password and revokes all sessions in one transaction", async () => {
      const token = "raw-reset-token";
      prisma.client.user.findUnique.mockResolvedValue({
        ...baseUser,
        passwordResetToken: hashToken(token),
        passwordResetExpires: new Date(Date.now() + 1_000_000),
      });
      prisma.client.$transaction.mockResolvedValue([{}, {}]);

      await authService.resetPassword(token, "N3wPassw0rd");

      expect(prisma.client.$transaction).toHaveBeenCalledTimes(1);
    });
  });
});
