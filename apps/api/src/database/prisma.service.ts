import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { prisma, PrismaClient } from "@one-order/database";

// Wraps the shared @one-order/database singleton so NestJS can manage its
// lifecycle (connect on boot, disconnect on shutdown) through DI, without
// spawning a second PrismaClient/connection pool alongside it.
@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  public readonly client: PrismaClient = prisma;

  async onModuleInit() {
    await this.client.$connect();
    this.logger.log("Connected to MySQL via Prisma");
  }

  async onModuleDestroy() {
    await this.client.$disconnect();
  }
}
