import { prisma } from "../../src/index";
import { menu, type MenuOptionGroup } from "./menu-data";

// Turkish/Dutch characters that don't decompose cleanly via NFD normalization.
const CHAR_MAP: Record<string, string> = {
  ı: "i",
  İ: "i",
  ş: "s",
  Ş: "s",
  ğ: "g",
  Ğ: "g",
  ç: "c",
  Ç: "c",
  ö: "o",
  Ö: "o",
  ü: "u",
  Ü: "u",
  ë: "e",
  ï: "i",
};

function slugify(name: string): string {
  const normalized = name
    .split("")
    .map((char) => CHAR_MAP[char] ?? char)
    .join("")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

  return normalized
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildVariantGroupCreate(group: MenuOptionGroup) {
  return {
    translations: { create: [{ locale: "NL" as const, name: group.name }] },
    variants: {
      create: group.options.map((option, index) => ({
        priceModifier: option.priceModifier,
        isDefault: index === 0,
        sortOrder: index,
        translations: { create: [{ locale: "NL" as const, name: option.name }] },
      })),
    },
  };
}

function buildExtraGroupCreate(group: MenuOptionGroup) {
  return {
    minSelect: group.minSelect ?? 0,
    maxSelect: group.maxSelect ?? group.options.length,
    isRequired: group.isRequired ?? false,
    translations: { create: [{ locale: "NL" as const, name: group.name }] },
    extras: {
      create: group.options.map((option, index) => ({
        priceModifier: option.priceModifier,
        sortOrder: index,
        translations: { create: [{ locale: "NL" as const, name: option.name }] },
      })),
    },
  };
}

async function deactivateStaleMenu(): Promise<{ products: number; categories: number }> {
  const activeSkus = menu.flatMap((category) => category.products.map((product) => product.sku));
  const activeSlugs = menu.map((category) => category.slug);

  const staleProducts = await prisma.product.findMany({
    where: { isActive: true, sku: { notIn: activeSkus } },
    select: { id: true, translations: { select: { id: true, locale: true, slug: true } } },
  });

  // A product's translations keep their (locale, slug) unique key even after
  // deactivation, so a re-import that wants that slug back for a new product
  // would otherwise collide with the hidden old one. Free the slug by
  // suffixing it with the product id — historical orders don't depend on it
  // (OrderItem stores its own name/price snapshots, not a live join).
  for (const product of staleProducts) {
    // eslint-disable-next-line no-await-in-loop
    await prisma.$transaction(
      product.translations.map((translation) =>
        prisma.productTranslation.update({
          where: { id: translation.id },
          data: { slug: `${translation.slug}-old-${product.id}` },
        }),
      ),
    );
  }

  const staleProductUpdate = await prisma.product.updateMany({
    where: { id: { in: staleProducts.map((p) => p.id) } },
    data: { isActive: false, deletedAt: new Date() },
  });

  const staleCategories = await prisma.category.updateMany({
    where: { isActive: true, slug: { notIn: activeSlugs } },
    data: { isActive: false, deletedAt: new Date() },
  });

  return { products: staleProductUpdate.count, categories: staleCategories.count };
}

async function main() {
  console.log("🍽  Importing ONE ORDER menu...\n");

  // Products/categories from a previous menu that no longer appear in the
  // current `menu` data are hidden rather than deleted — orders can still
  // reference them (Product.categoryId and OrderItem.productId are
  // onDelete: Restrict), so a hard delete would break order history.
  const stale = await deactivateStaleMenu();
  if (stale.products > 0 || stale.categories > 0) {
    console.log(`🗄  Deactivated ${stale.products} old products and ${stale.categories} old categories\n`);
  }

  let categoriesCreated = 0;
  let productsCreated = 0;
  let productsSkipped = 0;

  for (const categoryData of menu) {
    const category = await prisma.category.upsert({
      where: { slug: categoryData.slug },
      update: { sortOrder: categoryData.sortOrder, isActive: true, deletedAt: null },
      create: {
        slug: categoryData.slug,
        sortOrder: categoryData.sortOrder,
        translations: { create: [{ locale: "NL", name: categoryData.name }] },
      },
    });
    categoriesCreated += 1;

    for (const [index, productData] of categoryData.products.entries()) {
      const existing = await prisma.product.findUnique({ where: { sku: productData.sku } });
      if (existing) {
        productsSkipped += 1;
        continue;
      }

      const slug = slugify(productData.name);

      // Each product may declare multiple option groups (variant + extra, or
      // several extra groups for something like "Make Your Own Bowl") — split
      // them by kind and merge into one product-create call.
      const groups = productData.groups ?? [];
      const variantGroups = groups.filter((g) => g.kind === "variant").map(buildVariantGroupCreate);
      const extraGroups = groups.filter((g) => g.kind === "extra").map(buildExtraGroupCreate);

      await prisma.product.create({
        data: {
          categoryId: category.id,
          sku: productData.sku,
          basePrice: productData.basePrice,
          vatCategory: "FOOD_TAKEAWAY",
          sortOrder: index,
          translations: {
            create: [{ locale: "NL", name: productData.name, description: productData.description, slug }],
          },
          ...(variantGroups.length > 0 ? { variantGroups: { create: variantGroups } } : {}),
          ...(extraGroups.length > 0 ? { extraGroups: { create: extraGroups } } : {}),
        },
      });
      productsCreated += 1;
    }

    console.log(`✔ ${categoryData.name} (${categoryData.products.length} products)`);
  }

  console.log(
    `\n✅ Menu import complete: ${categoriesCreated} categories, ${productsCreated} products created, ${productsSkipped} already existed (skipped).`,
  );
  console.log(
    "⚠️  All prices are placeholder €0.00 — update them (via Prisma Studio, a direct query, or the future admin panel) before going live.",
  );
}

main()
  .catch((error) => {
    console.error("❌ Menu import failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
