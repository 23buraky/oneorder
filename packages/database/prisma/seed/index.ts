import { PrismaClient, VatCategory, LoyaltyLevel, Locale } from "../../generated/client";

const prisma = new PrismaClient();

/**
 * Seeds the reference/config data that ONE ORDER needs to function
 * regardless of which menu is imported later:
 *  - VAT rate configuration (Belgian rates)
 *  - The 14 official EU allergens, translated NL/EN/FR/TR
 *  - Default opening hours (Mon-Sun)
 *  - Loyalty level thresholds
 */

const LOCALES: Locale[] = ["NL", "EN", "FR", "TR"];

async function seedVatRates() {
  const rates: { category: VatCategory; ratePercentage: number }[] = [
    { category: "FOOD_TAKEAWAY", ratePercentage: 6.0 },
    { category: "BEVERAGE_STANDARD", ratePercentage: 21.0 },
    { category: "OTHER_STANDARD", ratePercentage: 21.0 },
  ];

  for (const rate of rates) {
    await prisma.vatRateConfig.upsert({
      where: { category: rate.category },
      update: { ratePercentage: rate.ratePercentage },
      create: rate,
    });
  }
  console.log(`✔ VAT rate config seeded (${rates.length} categories)`);
}

// The 14 allergens EU law requires food businesses to disclose.
const ALLERGENS: Record<string, Record<Locale, string>> = {
  gluten: { NL: "Gluten", EN: "Gluten", FR: "Gluten", TR: "Gluten" },
  crustaceans: { NL: "Schaaldieren", EN: "Crustaceans", FR: "Crustacés", TR: "Kabuklu deniz ürünleri" },
  eggs: { NL: "Eieren", EN: "Eggs", FR: "Œufs", TR: "Yumurta" },
  fish: { NL: "Vis", EN: "Fish", FR: "Poisson", TR: "Balık" },
  peanuts: { NL: "Pinda's", EN: "Peanuts", FR: "Arachides", TR: "Yer fıstığı" },
  soybeans: { NL: "Soja", EN: "Soybeans", FR: "Soja", TR: "Soya" },
  milk: { NL: "Melk (lactose)", EN: "Milk (lactose)", FR: "Lait (lactose)", TR: "Süt (laktoz)" },
  nuts: { NL: "Noten", EN: "Tree nuts", FR: "Fruits à coque", TR: "Kuruyemiş" },
  celery: { NL: "Selderij", EN: "Celery", FR: "Céleri", TR: "Kereviz" },
  mustard: { NL: "Mosterd", EN: "Mustard", FR: "Moutarde", TR: "Hardal" },
  sesame: { NL: "Sesamzaad", EN: "Sesame seeds", FR: "Graines de sésame", TR: "Susam" },
  sulphites: { NL: "Sulfiet", EN: "Sulphites", FR: "Sulfites", TR: "Sülfitler" },
  lupin: { NL: "Lupine", EN: "Lupin", FR: "Lupin", TR: "Acı bakla" },
  molluscs: { NL: "Weekdieren", EN: "Molluscs", FR: "Mollusques", TR: "Yumuşakçalar" },
};

async function seedAllergens() {
  for (const [key, translations] of Object.entries(ALLERGENS)) {
    const existing = await prisma.allergenTranslation.findFirst({
      where: { locale: "EN", name: translations.EN },
    });

    const allergenId = existing
      ? existing.allergenId
      : (await prisma.allergen.create({ data: { icon: key } })).id;

    for (const locale of LOCALES) {
      await prisma.allergenTranslation.upsert({
        where: { allergenId_locale: { allergenId, locale } },
        update: { name: translations[locale] },
        create: { allergenId, locale, name: translations[locale] },
      });
    }
  }
  console.log(`✔ Allergens seeded (${Object.keys(ALLERGENS).length} allergens × ${LOCALES.length} locales)`);
}

async function seedOpeningHours() {
  // 0 = Sunday ... 6 = Saturday. Default: open every day 11:00-22:00.
  for (let dayOfWeek = 0; dayOfWeek <= 6; dayOfWeek++) {
    await prisma.openingHours.upsert({
      where: { dayOfWeek },
      update: {},
      create: {
        dayOfWeek,
        openTime: "11:00",
        closeTime: "22:00",
        isClosed: false,
      },
    });
  }
  console.log("✔ Default opening hours seeded (Mon-Sun, 11:00-22:00)");
}

async function seedLoyaltyLevels() {
  const levels: { level: LoyaltyLevel; minPointsRequired: number; freeDelivery: boolean; perksDescription: string }[] = [
    { level: "BRONZE", minPointsRequired: 0, freeDelivery: false, perksDescription: "Welkom bij ONE ORDER" },
    { level: "SILVER", minPointsRequired: 500, freeDelivery: false, perksDescription: "5% extra punten per bestelling" },
    { level: "GOLD", minPointsRequired: 1500, freeDelivery: true, perksDescription: "Gratis levering + 10% extra punten" },
    { level: "PLATINUM", minPointsRequired: 4000, freeDelivery: true, perksDescription: "Gratis levering + 20% extra punten + exclusieve acties" },
  ];

  for (const level of levels) {
    await prisma.loyaltyLevelConfig.upsert({
      where: { level: level.level },
      update: level,
      create: level,
    });
  }
  console.log(`✔ Loyalty levels seeded (${levels.length} levels)`);
}

async function seedSettings() {
  const settings = [
    { key: "currency", value: "EUR", description: "Default currency" },
    { key: "default_locale", value: "nl", description: "Default site locale" },
    { key: "supported_locales", value: "nl,en,fr,tr", description: "Comma-separated supported locales" },
    { key: "loyalty_points_per_euro", value: "1", description: "Loyalty points earned per euro spent" },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value, description: setting.description },
      create: setting,
    });
  }
  console.log(`✔ Site settings seeded (${settings.length} keys)`);
}

async function main() {
  console.log("🌱 Seeding ONE ORDER reference data...\n");
  await seedVatRates();
  await seedAllergens();
  await seedOpeningHours();
  await seedLoyaltyLevels();
  await seedSettings();
  console.log("\n✅ Seed complete. Menu data (categories/products) will be imported separately.");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
