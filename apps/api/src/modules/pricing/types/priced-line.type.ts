import type { Locale, VatCategory } from "@one-order/database";

export interface PriceLineInput {
  productId: string;
  variantId?: string;
  extraIds?: string[];
  quantity: number;
  locale: Locale;
}

export interface PricedExtra {
  id: string;
  name: string;
  priceModifier: number;
}

export interface PricedLine {
  productId: string;
  productName: string;
  quantity: number;
  variantId: string | null;
  variantName: string | null;
  variantPriceModifier: number;
  extras: PricedExtra[];
  vatCategory: VatCategory;
  vatRatePercentage: number;
  // unitPrice/lineTotal are VAT-inclusive (the price the customer actually pays).
  unitPrice: number;
  lineSubtotal: number;
  lineVatAmount: number;
  lineTotal: number;
}
