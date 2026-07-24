import { Injectable, NotFoundException } from "@nestjs/common";
import type { Locale } from "@one-order/database";
import { PrismaService } from "../../database/prisma.service";
import type { FavoriteProductView } from "./types/favorite-product.type";

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string, locale: Locale): Promise<FavoriteProductView[]> {
    const favorites = await this.prisma.client.favoriteProduct.findMany({
      where: { userId, product: { deletedAt: null } },
      orderBy: { createdAt: "desc" },
      include: {
        product: {
          include: {
            translations: { where: { locale } },
            images: true,
          },
        },
      },
    });

    return favorites.map((favorite) => {
      const translation = favorite.product.translations[0];
      const primaryImage = favorite.product.images.find((image) => image.isPrimary) ?? favorite.product.images[0];

      return {
        id: favorite.product.id,
        sku: favorite.product.sku,
        slug: translation?.slug ?? favorite.product.id,
        name: translation?.name ?? favorite.product.sku,
        description: translation?.description ?? null,
        basePrice: favorite.product.basePrice.toNumber(),
        primaryImageUrl: primaryImage?.url ?? null,
        isActive: favorite.product.isActive,
        favoritedAt: favorite.createdAt,
      };
    });
  }

  async add(userId: string, productId: string): Promise<void> {
    const product = await this.prisma.client.product.findFirst({ where: { id: productId, deletedAt: null } });
    if (!product) {
      throw new NotFoundException(`Product with id "${productId}" not found`);
    }

    await this.prisma.client.favoriteProduct.upsert({
      where: { userId_productId: { userId, productId } },
      update: {},
      create: { userId, productId },
    });
  }

  async remove(userId: string, productId: string): Promise<void> {
    await this.prisma.client.favoriteProduct.deleteMany({ where: { userId, productId } });
  }
}
