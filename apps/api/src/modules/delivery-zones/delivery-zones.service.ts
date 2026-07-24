import { Injectable, NotFoundException } from "@nestjs/common";
import type { DeliveryZone } from "@one-order/database";
import { PrismaService } from "../../database/prisma.service";
import { CreateDeliveryZoneDto } from "./dto/create-delivery-zone.dto";
import { UpdateDeliveryZoneDto } from "./dto/update-delivery-zone.dto";

@Injectable()
export class DeliveryZonesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(): Promise<DeliveryZone[]> {
    return this.prisma.client.deliveryZone.findMany({ orderBy: { name: "asc" } });
  }

  // Application-side filter rather than a DB-level JSON query: MySQL's JSON
  // array-contains support varies by version, and the zone count here will
  // always be small (a handful of neighbourhoods, not thousands of rows).
  async findZoneForPostalCode(postalCode: string): Promise<DeliveryZone | null> {
    const zones = await this.prisma.client.deliveryZone.findMany({ where: { isActive: true } });
    return (
      zones.find((zone) => {
        const codes = zone.postalCodes as unknown as string[];
        return Array.isArray(codes) && codes.includes(postalCode);
      }) ?? null
    );
  }

  async create(dto: CreateDeliveryZoneDto): Promise<DeliveryZone> {
    return this.prisma.client.deliveryZone.create({
      data: {
        name: dto.name,
        postalCodes: dto.postalCodes,
        deliveryFee: dto.deliveryFee,
        minOrderAmount: dto.minOrderAmount,
        estimatedDeliveryMinutes: dto.estimatedDeliveryMinutes,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async update(id: string, dto: UpdateDeliveryZoneDto): Promise<DeliveryZone> {
    await this.getOrThrow(id);
    return this.prisma.client.deliveryZone.update({
      where: { id },
      data: {
        name: dto.name,
        postalCodes: dto.postalCodes,
        deliveryFee: dto.deliveryFee,
        minOrderAmount: dto.minOrderAmount,
        estimatedDeliveryMinutes: dto.estimatedDeliveryMinutes,
        isActive: dto.isActive,
      },
    });
  }

  async remove(id: string): Promise<void> {
    await this.getOrThrow(id);
    await this.prisma.client.deliveryZone.delete({ where: { id } });
  }

  private async getOrThrow(id: string): Promise<DeliveryZone> {
    const zone = await this.prisma.client.deliveryZone.findUnique({ where: { id } });
    if (!zone) {
      throw new NotFoundException(`Delivery zone with id "${id}" not found`);
    }
    return zone;
  }
}
