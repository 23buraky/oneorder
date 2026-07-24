import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { UpdateOpeningHoursDto } from "./dto/update-opening-hours.dto";
import { CreateOpeningHoursExceptionDto } from "./dto/create-opening-hours-exception.dto";

export interface OpenStatus {
  isOpen: boolean;
  reason?: string;
}

// See the Date.UTC() comment on isOpenNow(): MySQL DATE columns round-trip
// through UTC, so any Date built from local y/m/d parts drifts a day in
// zones ahead of UTC. Every write/read of an exception date must go through here.
function toUtcDateOnly(date: Date): Date {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
}

@Injectable()
export class OpeningHoursService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    return this.prisma.client.openingHours.findMany({ orderBy: { dayOfWeek: "asc" } });
  }

  async isOpenNow(now: Date = new Date()): Promise<OpenStatus> {
    const todayDate = toUtcDateOnly(now);

    const exception = await this.prisma.client.openingHoursException.findUnique({
      where: { date: todayDate },
    });

    if (exception) {
      if (exception.isClosed || !exception.openTime || !exception.closeTime) {
        return { isOpen: false, reason: exception.reason ?? "Closed today" };
      }
      return { isOpen: this.withinWindow(now, exception.openTime, exception.closeTime) };
    }

    const hours = await this.prisma.client.openingHours.findUnique({ where: { dayOfWeek: now.getDay() } });

    if (!hours || hours.isClosed || !hours.openTime || !hours.closeTime) {
      return { isOpen: false, reason: "Closed today" };
    }

    return { isOpen: this.withinWindow(now, hours.openTime, hours.closeTime) };
  }

  async updateDay(dayOfWeek: number, dto: UpdateOpeningHoursDto) {
    return this.prisma.client.openingHours.upsert({
      where: { dayOfWeek },
      update: { openTime: dto.openTime, closeTime: dto.closeTime, isClosed: dto.isClosed },
      create: { dayOfWeek, openTime: dto.openTime, closeTime: dto.closeTime, isClosed: dto.isClosed },
    });
  }

  async listExceptions() {
    return this.prisma.client.openingHoursException.findMany({ orderBy: { date: "asc" } });
  }

  async createException(dto: CreateOpeningHoursExceptionDto) {
    const date = toUtcDateOnly(dto.date);
    return this.prisma.client.openingHoursException.upsert({
      where: { date },
      update: { isClosed: dto.isClosed, openTime: dto.openTime, closeTime: dto.closeTime, reason: dto.reason },
      create: { date, isClosed: dto.isClosed, openTime: dto.openTime, closeTime: dto.closeTime, reason: dto.reason },
    });
  }

  async removeException(id: string): Promise<void> {
    const exception = await this.prisma.client.openingHoursException.findUnique({ where: { id } });
    if (!exception) {
      throw new NotFoundException(`Opening hours exception with id "${id}" not found`);
    }
    await this.prisma.client.openingHoursException.delete({ where: { id } });
  }

  private withinWindow(now: Date, openTime: string, closeTime: string): boolean {
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const [openH, openM] = openTime.split(":").map(Number);
    const [closeH, closeM] = closeTime.split(":").map(Number);
    return currentMinutes >= openH * 60 + openM && currentMinutes < closeH * 60 + closeM;
  }
}
