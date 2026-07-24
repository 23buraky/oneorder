import { Injectable, NotFoundException } from "@nestjs/common";
import type { Address } from "@one-order/database";
import { PrismaService } from "../../database/prisma.service";
import { CreateAddressDto } from "./dto/create-address.dto";
import { UpdateAddressDto } from "./dto/update-address.dto";

@Injectable()
export class AddressesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string): Promise<Address[]> {
    return this.prisma.client.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });
  }

  async create(userId: string, dto: CreateAddressDto): Promise<Address> {
    const existingCount = await this.prisma.client.address.count({ where: { userId } });
    // The very first address is always the default, regardless of what was sent.
    const makeDefault = dto.isDefault || existingCount === 0;

    if (makeDefault) {
      await this.unsetCurrentDefault(userId);
    }

    return this.prisma.client.address.create({
      data: {
        userId,
        label: dto.label,
        street: dto.street,
        houseNumber: dto.houseNumber,
        box: dto.box,
        postalCode: dto.postalCode,
        city: dto.city,
        country: dto.country ?? "BE",
        deliveryNote: dto.deliveryNote,
        isDefault: makeDefault,
      },
    });
  }

  async update(userId: string, id: string, dto: UpdateAddressDto): Promise<Address> {
    await this.getOwnedOrThrow(userId, id);

    if (dto.isDefault) {
      await this.unsetCurrentDefault(userId);
    }

    return this.prisma.client.address.update({
      where: { id },
      data: {
        label: dto.label,
        street: dto.street,
        houseNumber: dto.houseNumber,
        box: dto.box,
        postalCode: dto.postalCode,
        city: dto.city,
        country: dto.country,
        deliveryNote: dto.deliveryNote,
        isDefault: dto.isDefault,
      },
    });
  }

  async remove(userId: string, id: string): Promise<void> {
    const address = await this.getOwnedOrThrow(userId, id);
    await this.prisma.client.address.delete({ where: { id } });

    if (address.isDefault) {
      const nextDefault = await this.prisma.client.address.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
      if (nextDefault) {
        await this.prisma.client.address.update({ where: { id: nextDefault.id }, data: { isDefault: true } });
      }
    }
  }

  private async unsetCurrentDefault(userId: string): Promise<void> {
    await this.prisma.client.address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });
  }

  private async getOwnedOrThrow(userId: string, id: string): Promise<Address> {
    const address = await this.prisma.client.address.findFirst({ where: { id, userId } });
    if (!address) {
      throw new NotFoundException(`Address with id "${id}" not found`);
    }
    return address;
  }
}
