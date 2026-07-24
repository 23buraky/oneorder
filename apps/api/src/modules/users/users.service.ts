import { BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import type { User } from "@one-order/database";
import { PrismaService } from "../../database/prisma.service";
import { BCRYPT_SALT_ROUNDS } from "../auth/constants/auth.constants";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";
import type { UserProfileView } from "./types/user-profile.type";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string): Promise<UserProfileView> {
    const user = await this.getActiveOrThrow(userId);
    return this.toView(user);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<UserProfileView> {
    await this.getActiveOrThrow(userId);

    if (dto.phone) {
      const existing = await this.prisma.client.user.findUnique({ where: { phone: dto.phone } });
      if (existing && existing.id !== userId) {
        throw new ConflictException("This phone number is already in use");
      }
    }

    const user = await this.prisma.client.user.update({
      where: { id: userId },
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        preferredLocale: dto.preferredLocale,
        marketingOptIn: dto.marketingOptIn,
      },
    });

    return this.toView(user);
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.getActiveOrThrow(userId);

    if (!user.passwordHash) {
      throw new BadRequestException("This account signs in via a social login and has no password to change");
    }

    const currentPasswordValid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!currentPasswordValid) {
      throw new UnauthorizedException("Current password is incorrect");
    }

    const newPasswordHash = await bcrypt.hash(dto.newPassword, BCRYPT_SALT_ROUNDS);

    await this.prisma.client.$transaction([
      this.prisma.client.user.update({ where: { id: userId }, data: { passwordHash: newPasswordHash } }),
      // Force re-login on every other device once the password changes.
      this.prisma.client.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);
  }

  private async getActiveOrThrow(userId: string): Promise<User> {
    const user = await this.prisma.client.user.findFirst({ where: { id: userId, deletedAt: null } });
    if (!user) {
      throw new NotFoundException("User not found");
    }
    return user;
  }

  private toView(user: User): UserProfileView {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      preferredLocale: user.preferredLocale,
      marketingOptIn: user.marketingOptIn,
      role: user.role,
      authProvider: user.authProvider,
      isEmailVerified: user.isEmailVerified,
      loyaltyPoints: user.loyaltyPoints,
      loyaltyLevel: user.loyaltyLevel,
      createdAt: user.createdAt,
    };
  }
}
