import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import type { Locale } from "@one-order/database";
import { PrismaService } from "../../database/prisma.service";
import { roundToCents } from "./utils/money.util";
import type { PriceLineInput, PricedLine } from "./types/priced-line.type";

const pricingInclude = (locale: Locale) => ({
  translations: { where: { locale } },
  variantGroups: {
    include: { variants: { include: { translations: { where: { locale } } } } },
  },
  extraGroups: {
    include: { extras: { include: { translations: { where: { locale } } } } },
  },
});

@Injectable()
export class PricingService {
  constructor(private readonly prisma: PrismaService) {}

  // Validates that the requested variant/extra selection is legal for this
  // product (belongs to it, respects each extra group's min/max/required
  // rules) and returns the fully priced, fully named line. Cart and Orders
  // both funnel through this so "how much does this cost" is computed and
  // labelled in exactly one place.
  async priceLine(input: PriceLineInput): Promise<PricedLine> {
    if (input.quantity < 1) {
      throw new BadRequestException("Quantity must be at least 1");
    }

    const product = await this.prisma.client.product.findFirst({
      where: { id: input.productId, isActive: true, deletedAt: null },
      include: pricingInclude(input.locale),
    });

    if (!product) {
      throw new NotFoundException(`Product with id "${input.productId}" not found`);
    }

    const variant = this.resolveVariant(product, input.variantId);
    const extras = this.resolveExtras(product, input.extraIds ?? []);

    const vatConfig = await this.prisma.client.vatRateConfig.findUnique({
      where: { category: product.vatCategory },
    });
    if (!vatConfig) {
      throw new NotFoundException(`No VAT rate configured for category "${product.vatCategory}"`);
    }

    const variantPriceModifier = variant?.priceModifier.toNumber() ?? 0;
    const extrasTotal = extras.reduce((sum, extra) => sum + extra.priceModifier, 0);

    const unitPrice = roundToCents(product.basePrice.toNumber() + variantPriceModifier + extrasTotal);
    const lineTotal = roundToCents(unitPrice * input.quantity);
    const vatRatePercentage = vatConfig.ratePercentage.toNumber();
    // basePrice is VAT-inclusive (standard EU B2C display), so VAT is
    // extracted out of the total rather than added on top of it.
    const lineVatAmount = roundToCents(lineTotal - lineTotal / (1 + vatRatePercentage / 100));
    const lineSubtotal = roundToCents(lineTotal - lineVatAmount);

    return {
      productId: product.id,
      productName: product.translations[0]?.name ?? product.sku,
      quantity: input.quantity,
      variantId: variant?.id ?? null,
      variantName: variant?.translations[0]?.name ?? null,
      variantPriceModifier,
      extras: extras.map((extra) => ({
        id: extra.id,
        name: extra.translations[0]?.name ?? "",
        priceModifier: extra.priceModifier,
      })),
      vatCategory: product.vatCategory,
      vatRatePercentage,
      unitPrice,
      lineSubtotal,
      lineVatAmount,
      lineTotal,
    };
  }

  private resolveVariant(
    product: {
      variantGroups: {
        variants: { id: string; priceModifier: { toNumber(): number }; translations: { name: string }[] }[];
      }[];
    },
    variantId: string | undefined,
  ) {
    const allVariants = product.variantGroups.flatMap((group) => group.variants);

    if (allVariants.length > 0 && !variantId) {
      throw new BadRequestException("This product requires selecting a variant");
    }

    if (!variantId) {
      return undefined;
    }

    const variant = allVariants.find((v) => v.id === variantId);
    if (!variant) {
      throw new BadRequestException(`Variant "${variantId}" does not belong to this product`);
    }

    return variant;
  }

  private resolveExtras(
    product: {
      extraGroups: {
        minSelect: number;
        maxSelect: number;
        isRequired: boolean;
        extras: {
          id: string;
          priceModifier: { toNumber(): number };
          isActive: boolean;
          translations: { name: string }[];
        }[];
      }[];
    },
    extraIds: string[],
  ) {
    const allExtrasById = new Map(
      product.extraGroups.flatMap((group) => group.extras).map((extra) => [extra.id, extra]),
    );

    for (const id of extraIds) {
      const extra = allExtrasById.get(id);
      if (!extra) {
        throw new BadRequestException(`Extra "${id}" does not belong to this product`);
      }
      if (!extra.isActive) {
        throw new BadRequestException(`Extra "${id}" is no longer available`);
      }
    }

    for (const group of product.extraGroups) {
      const groupExtraIds = new Set(group.extras.map((extra) => extra.id));
      const selectedCount = extraIds.filter((id) => groupExtraIds.has(id)).length;

      if (selectedCount < group.minSelect || (group.isRequired && selectedCount === 0)) {
        throw new BadRequestException(
          `You must select at least ${Math.max(group.minSelect, group.isRequired ? 1 : 0)} option(s) from this extra group`,
        );
      }
      if (selectedCount > group.maxSelect) {
        throw new BadRequestException(`You can select at most ${group.maxSelect} option(s) from this extra group`);
      }
    }

    return extraIds.map((id) => {
      const extra = allExtrasById.get(id) as {
        id: string;
        priceModifier: { toNumber(): number };
        translations: { name: string }[];
      };
      return {
        id: extra.id,
        priceModifier: extra.priceModifier.toNumber(),
        translations: extra.translations,
      };
    });
  }
}
