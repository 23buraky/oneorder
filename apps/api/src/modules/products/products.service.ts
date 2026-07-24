import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import type { Locale, Prisma } from "@one-order/database";
import { PrismaService } from "../../database/prisma.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { ListProductsQueryDto } from "./dto/list-products-query.dto";
import { isAvailableNow } from "./utils/availability.util";
import type {
  PaginatedResult,
  ProductDetail,
  ProductListItem,
} from "./types/product-response.type";

const listInclude = (locale: Locale) => ({
  translations: { where: { locale } },
  images: true,
  allergens: { include: { allergen: { include: { translations: { where: { locale } } } } } },
  availability: true,
});

const detailInclude = (locale: Locale) => ({
  translations: { where: { locale } },
  images: { orderBy: { sortOrder: "asc" as const } },
  variantGroups: {
    orderBy: { sortOrder: "asc" as const },
    include: {
      translations: { where: { locale } },
      variants: {
        orderBy: { sortOrder: "asc" as const },
        include: { translations: { where: { locale } } },
      },
    },
  },
  extraGroups: {
    orderBy: { sortOrder: "asc" as const },
    include: {
      translations: { where: { locale } },
      extras: {
        orderBy: { sortOrder: "asc" as const },
        include: { translations: { where: { locale } } },
      },
    },
  },
  ingredients: { include: { ingredient: { include: { translations: { where: { locale } } } } } },
  allergens: { include: { allergen: { include: { translations: { where: { locale } } } } } },
  availability: true,
});

type ProductForList = Prisma.ProductGetPayload<{ include: ReturnType<typeof listInclude> }>;
type ProductForDetail = Prisma.ProductGetPayload<{ include: ReturnType<typeof detailInclude> }>;

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ListProductsQueryDto): Promise<PaginatedResult<ProductListItem>> {
    const where: Prisma.ProductWhereInput = {
      isActive: true,
      deletedAt: null,
      ...(query.categorySlug ? { category: { slug: query.categorySlug } } : {}),
    };

    const [products, total] = await this.prisma.client.$transaction([
      this.prisma.client.product.findMany({
        where,
        orderBy: { sortOrder: "asc" },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
        include: listInclude(query.locale),
      }),
      this.prisma.client.product.count({ where }),
    ]);

    return {
      items: products.map((product) => this.toListItem(product)),
      total,
      page: query.page,
      pageSize: query.pageSize,
    };
  }

  async findBySlug(slug: string, locale: Locale): Promise<ProductDetail> {
    const product = await this.prisma.client.product.findFirst({
      where: { isActive: true, deletedAt: null, translations: { some: { locale, slug } } },
      include: detailInclude(locale),
    });

    if (!product) {
      throw new NotFoundException(`Product "${slug}" not found`);
    }

    return this.toDetail(product);
  }

  async create(dto: CreateProductDto): Promise<ProductDetail> {
    await this.assertSkuAvailable(dto.sku);
    await this.assertSlugsAvailable(dto.translations.map((t) => ({ locale: t.locale, slug: t.slug })));

    const product = await this.prisma.client.product.create({
      data: {
        categoryId: dto.categoryId,
        sku: dto.sku,
        basePrice: dto.basePrice,
        vatCategory: dto.vatCategory,
        isActive: dto.isActive ?? true,
        stock: dto.stock,
        sortOrder: dto.sortOrder ?? 0,
        translations: { create: dto.translations },
        images: dto.images ? { create: dto.images } : undefined,
        variantGroups: dto.variantGroups
          ? {
              create: dto.variantGroups.map((group) => ({
                sortOrder: group.sortOrder ?? 0,
                translations: { create: group.translations },
                variants: {
                  create: group.variants.map((variant) => ({
                    priceModifier: variant.priceModifier,
                    sortOrder: variant.sortOrder ?? 0,
                    isDefault: variant.isDefault ?? false,
                    translations: { create: variant.translations },
                  })),
                },
              })),
            }
          : undefined,
        extraGroups: dto.extraGroups
          ? {
              create: dto.extraGroups.map((group) => ({
                minSelect: group.minSelect ?? 0,
                maxSelect: group.maxSelect ?? 1,
                isRequired: group.isRequired ?? false,
                sortOrder: group.sortOrder ?? 0,
                translations: { create: group.translations },
                extras: {
                  create: group.extras.map((extra) => ({
                    priceModifier: extra.priceModifier,
                    isDefault: extra.isDefault ?? false,
                    isActive: extra.isActive ?? true,
                    sortOrder: extra.sortOrder ?? 0,
                    translations: { create: extra.translations },
                  })),
                },
              })),
            }
          : undefined,
        ingredients: dto.ingredientIds
          ? { create: dto.ingredientIds.map((ingredientId) => ({ ingredientId })) }
          : undefined,
        allergens: dto.allergenIds
          ? { create: dto.allergenIds.map((allergenId) => ({ allergenId })) }
          : undefined,
        availability: dto.availability ? { create: dto.availability } : undefined,
      },
      include: detailInclude(dto.translations[0].locale),
    });

    return this.toDetail(product);
  }

  async update(id: string, dto: UpdateProductDto): Promise<ProductDetail> {
    const existing = await this.getActiveOrThrow(id);

    if (dto.sku && dto.sku !== existing.sku) {
      await this.assertSkuAvailable(dto.sku);
    }
    if (dto.translations) {
      await this.assertSlugsAvailable(
        dto.translations.map((t) => ({ locale: t.locale, slug: t.slug })),
        id,
      );
    }

    const product = await this.prisma.client.product.update({
      where: { id },
      data: {
        categoryId: dto.categoryId,
        sku: dto.sku,
        basePrice: dto.basePrice,
        vatCategory: dto.vatCategory,
        isActive: dto.isActive,
        stock: dto.stock,
        sortOrder: dto.sortOrder,
        translations: dto.translations && {
          upsert: dto.translations.map((translation) => ({
            where: { productId_locale: { productId: id, locale: translation.locale } },
            create: translation,
            update: translation,
          })),
        },
        images: dto.images && {
          deleteMany: {},
          create: dto.images,
        },
      },
      include: detailInclude(dto.translations?.[0]?.locale ?? "NL"),
    });

    return this.toDetail(product);
  }

  async remove(id: string): Promise<void> {
    await this.getActiveOrThrow(id);
    await this.prisma.client.product.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }

  private async getActiveOrThrow(id: string) {
    const product = await this.prisma.client.product.findFirst({ where: { id, deletedAt: null } });
    if (!product) {
      throw new NotFoundException(`Product with id "${id}" not found`);
    }
    return product;
  }

  private async assertSkuAvailable(sku: string): Promise<void> {
    const existing = await this.prisma.client.product.findUnique({ where: { sku } });
    if (existing) {
      throw new ConflictException(`A product with SKU "${sku}" already exists`);
    }
  }

  private async assertSlugsAvailable(
    slugs: { locale: Locale; slug: string }[],
    excludeProductId?: string,
  ): Promise<void> {
    for (const { locale, slug } of slugs) {
      const existing = await this.prisma.client.productTranslation.findUnique({
        where: { locale_slug: { locale, slug } },
      });
      if (existing && existing.productId !== excludeProductId) {
        throw new ConflictException(`Slug "${slug}" is already in use for locale ${locale}`);
      }
    }
  }

  private toListItem(product: ProductForList): ProductListItem {
    const translation = product.translations[0];
    const primaryImage = product.images.find((image) => image.isPrimary) ?? product.images[0];

    return {
      id: product.id,
      sku: product.sku,
      slug: translation?.slug ?? product.id,
      name: translation?.name ?? product.sku,
      description: translation?.description ?? null,
      basePrice: product.basePrice.toNumber(),
      primaryImageUrl: primaryImage?.url ?? null,
      isActive: product.isActive,
      stock: product.stock,
      allergenNames: product.allergens
        .map((link) => link.allergen.translations[0]?.name)
        .filter((name): name is string => Boolean(name)),
      isAvailableNow: isAvailableNow(product.availability),
    };
  }

  private toDetail(product: ProductForDetail): ProductDetail {
    const translation = product.translations[0];

    return {
      id: product.id,
      sku: product.sku,
      slug: translation?.slug ?? product.id,
      name: translation?.name ?? product.sku,
      description: translation?.description ?? null,
      basePrice: product.basePrice.toNumber(),
      vatCategory: product.vatCategory,
      isActive: product.isActive,
      stock: product.stock,
      images: product.images.map((image) => ({
        url: image.url,
        altText: image.altText,
        isPrimary: image.isPrimary,
        sortOrder: image.sortOrder,
      })),
      variantGroups: product.variantGroups.map((group) => ({
        id: group.id,
        name: group.translations[0]?.name ?? "",
        sortOrder: group.sortOrder,
        variants: group.variants.map((variant) => ({
          id: variant.id,
          name: variant.translations[0]?.name ?? "",
          priceModifier: variant.priceModifier.toNumber(),
          isDefault: variant.isDefault,
          sortOrder: variant.sortOrder,
        })),
      })),
      extraGroups: product.extraGroups.map((group) => ({
        id: group.id,
        name: group.translations[0]?.name ?? "",
        minSelect: group.minSelect,
        maxSelect: group.maxSelect,
        isRequired: group.isRequired,
        sortOrder: group.sortOrder,
        extras: group.extras.map((extra) => ({
          id: extra.id,
          name: extra.translations[0]?.name ?? "",
          priceModifier: extra.priceModifier.toNumber(),
          isDefault: extra.isDefault,
          isActive: extra.isActive,
          sortOrder: extra.sortOrder,
        })),
      })),
      ingredients: product.ingredients.map((link) => ({
        id: link.ingredient.id,
        name: link.ingredient.translations[0]?.name ?? "",
      })),
      allergens: product.allergens.map((link) => ({
        id: link.allergen.id,
        name: link.allergen.translations[0]?.name ?? "",
        icon: link.allergen.icon,
      })),
      availability: product.availability.map((window) => ({
        dayOfWeek: window.dayOfWeek,
        startTime: window.startTime,
        endTime: window.endTime,
      })),
      isAvailableNow: isAvailableNow(product.availability),
    };
  }
}
