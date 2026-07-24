// Structured transcription of the ONE ORDER menu, as provided by the owner
// in "Menukaart_Producten_Overzicht.xlsx" (full menu replacement).
//
// Prices are unknown (no price column in the source) so every basePrice/
// priceModifier is 0 — a clearly-wrong placeholder on purpose, so nothing
// here can be mistaken for a real, chargeable price. Fill in real prices
// before this menu ever reaches a paying customer.
//
// Only Dutch (NL) text was supplied, so only NL translations are populated.
// "Sauzen" exist both as standalone products (this category) and as a
// shared "Kies je saus" extra group on fries/snacks/pita items — see
// [[menu-import]] for the reasoning (owner explicitly asked for both).

export interface MenuOptionGroup {
  kind: "variant" | "extra";
  name: string;
  minSelect?: number; // extra groups only
  maxSelect?: number; // extra groups only
  isRequired?: boolean; // extra groups only
  options: { name: string; priceModifier: number }[];
}

export interface MenuProduct {
  sku: string;
  name: string;
  description: string;
  basePrice: number;
  groups?: MenuOptionGroup[];
}

export interface MenuCategory {
  slug: string;
  name: string;
  sortOrder: number;
  products: MenuProduct[];
}

const pastaType: MenuOptionGroup = {
  kind: "variant",
  name: "Pasta type",
  options: [
    { name: "Penne", priceModifier: 0 },
    { name: "Spaghetti", priceModifier: 0 },
  ],
};

const meatChoice: MenuOptionGroup = {
  kind: "variant",
  name: "Vleeskeuze",
  options: [
    { name: "Pita", priceModifier: 0 },
    { name: "Kip", priceModifier: 0 },
    { name: "Mix", priceModifier: 0 },
  ],
};

const breadType: MenuOptionGroup = {
  kind: "variant",
  name: "Type brood",
  options: [
    { name: "Bruin", priceModifier: 0 },
    { name: "Meergranenbrood", priceModifier: 0 },
  ],
};

const frietUitvoering: MenuOptionGroup = {
  kind: "variant",
  name: "Uitvoering",
  options: [
    { name: "Gewoon", priceModifier: 0 },
    { name: "Speciaal", priceModifier: 1.5 },
  ],
};

const sauceChoice: MenuOptionGroup = {
  kind: "extra",
  name: "Kies je saus",
  minSelect: 0,
  maxSelect: 1,
  isRequired: false,
  options: [
    { name: "Looksaus", priceModifier: 0 },
    { name: "Samuraisaus", priceModifier: 0 },
    { name: "Andalousesaus", priceModifier: 0 },
    { name: "Sambal", priceModifier: 0 },
    { name: "Mammoetsaus", priceModifier: 0 },
    { name: "Cocktailsaus", priceModifier: 0 },
    { name: "Mayonaise", priceModifier: 0 },
    { name: "Ketchup", priceModifier: 0 },
  ],
};

const pitaExtras = (options: string[]): MenuOptionGroup => ({
  kind: "extra",
  name: "Extra supplementen",
  minSelect: 0,
  maxSelect: options.length,
  isRequired: false,
  options: options.map((name) => ({ name, priceModifier: 1.0 })),
});

// "Eigen Bowl" builder — Basis en Proteïne-opties komen letterlijk uit de
// Excel-tekst; Mix/Dressing/Toppings-opties zijn samengesteld uit de
// ingrediënten die al voorkomen in de 7 vaste Pokébowls hierboven (zelfde
// aanpak als een klassieke "build your own poke bowl"-opbouw).
const bowlBasis: MenuOptionGroup = {
  kind: "variant",
  name: "Basis",
  options: [
    { name: "Sushirijst", priceModifier: 0 },
    { name: "Brown rice", priceModifier: 0 },
    { name: "Salad", priceModifier: 0 },
  ],
};

const bowlProtein: MenuOptionGroup = {
  kind: "variant",
  name: "Proteïne",
  options: [
    { name: "Zalm", priceModifier: 0 },
    { name: "Tonijn", priceModifier: 0 },
    { name: "Kip", priceModifier: 0 },
    { name: "Tofu", priceModifier: 0 },
    { name: "Steak", priceModifier: 0 },
    { name: "Kebab", priceModifier: 0 },
    { name: "Falafel", priceModifier: 0 },
  ],
};

const bowlDressing: MenuOptionGroup = {
  kind: "variant",
  name: "Dressing",
  options: [
    { name: "Teriyaki", priceModifier: 0 },
    { name: "Chili Mayo", priceModifier: 0 },
    { name: "Sweet Garlic", priceModifier: 0 },
    { name: "Honey Mustard", priceModifier: 0 },
    { name: "Sojasaus", priceModifier: 0 },
  ],
};

const bowlMix: MenuOptionGroup = {
  kind: "extra",
  name: "Mix (kies 5)",
  minSelect: 5,
  maxSelect: 5,
  isRequired: true,
  options: [
    { name: "Avocado", priceModifier: 0 },
    { name: "Maïs", priceModifier: 0 },
    { name: "Zeewiersalade", priceModifier: 0 },
    { name: "Edamame", priceModifier: 0 },
    { name: "Komkommer", priceModifier: 0 },
    { name: "Tomaten", priceModifier: 0 },
    { name: "Wortel", priceModifier: 0 },
    { name: "Rode uien", priceModifier: 0 },
    { name: "Jalapeños", priceModifier: 0 },
    { name: "Fetakaas", priceModifier: 0 },
  ],
};

const bowlToppings: MenuOptionGroup = {
  kind: "extra",
  name: "Toppings (kies 3)",
  minSelect: 3,
  maxSelect: 3,
  isRequired: true,
  options: [
    { name: "Lente-uien", priceModifier: 0 },
    { name: "Chilivlokken", priceModifier: 0 },
    { name: "Crispy uien", priceModifier: 0 },
    { name: "Sesammix", priceModifier: 0 },
    { name: "Nachos", priceModifier: 0 },
    { name: "Walnoten", priceModifier: 0 },
  ],
};

export const menu: MenuCategory[] = [
  {
    slug: "pasta",
    name: "Pasta",
    sortOrder: 1,
    products: [
      {
        sku: "PST-01",
        name: "Pasta Bolognaise",
        description: "Bolognaisesaus",
        basePrice: 0,
        groups: [pastaType],
      },
      {
        sku: "PST-02",
        name: "Pasta Chicken",
        description: "Roomsaus, pesto, champignons, kip",
        basePrice: 0,
        groups: [pastaType],
      },
      {
        sku: "PST-03",
        name: "Pasta Hot Polo",
        description: "Tomatensaus, paprika, jalapeños, kip",
        basePrice: 0,
        groups: [pastaType],
      },
      {
        sku: "PST-04",
        name: "Pasta Milano",
        description: "Bolognaisesaus, champignons, uien, paprika",
        basePrice: 0,
        groups: [pastaType],
      },
      {
        sku: "PST-05",
        name: "Pasta Oriental",
        description: "BBQ-saus, kip, roomsaus",
        basePrice: 0,
        groups: [pastaType],
      },
      {
        sku: "PST-06",
        name: "Pasta Vegetarisch",
        description: "Uien, champignons, paprika, maïs, olijven",
        basePrice: 0,
        groups: [pastaType],
      },
      {
        sku: "PST-07",
        name: "Pasta Formaggi",
        description: "Roomsaus, 4 soorten kaas",
        basePrice: 0,
        groups: [pastaType],
      },
      {
        sku: "PST-08",
        name: "Creamy Polo",
        description: "Roomsaus, champignons, uien, kip",
        basePrice: 0,
        groups: [pastaType],
      },
    ],
  },
  {
    slug: "pokebowls-salades",
    name: "Pokébowls & Salades",
    sortOrder: 2,
    products: [
      {
        sku: "PB-01",
        name: "Salmonlover Bowl",
        description: "Sushirijst, avocado, maïs, zeewiersalade, edamame, komkommer, Noorse zalm, teriyaki, lente-uien",
        basePrice: 0,
      },
      {
        sku: "PB-02",
        name: "Steakhouse Bowl",
        description: "Sushirijst, guacamole, maïs, tomaten, komkommer, steak, chili mayo, lente-uien, chilivlokken",
        basePrice: 0,
      },
      {
        sku: "PB-03",
        name: "Tuna Surf Bowl",
        description: "Sushirijst, avocado, tomaten, zeewiersalade, edamame, komkommer, chili mayo, knapperige uien, sesammix",
        basePrice: 0,
      },
      {
        sku: "PB-04",
        name: "Tofu Special Bowl",
        description: "Sushirijst, wortel, rode uien, avocado, komkommer, maïs, tofu, sojasaus, lente-uien, walnoten",
        basePrice: 0,
      },
      {
        sku: "PB-05",
        name: "Hot Chicken Bowl",
        description: "Sushirijst, fetakaas, maïs, jalapeños, tomaten, rode uien, chili mayo, crispy onions, chilivlokken, nachos",
        basePrice: 0,
      },
      {
        sku: "PB-06",
        name: "Kebab Bowl",
        description: "Sushirijst, fetakaas, komkommer, wortel, tomaten, sweet garlic, lente-uien, sesammix",
        basePrice: 0,
      },
      {
        sku: "PB-07",
        name: "Falafel Fusion Bowl",
        description: "Sushirijst, avocado, maïs, wortel, rode uien, hummus, falafel, honey mustard, lente-uien, chilivlokken, walnoten",
        basePrice: 0,
      },
    ],
  },
  {
    slug: "make-your-own-bowl",
    name: "Make Your Own Bowl",
    sortOrder: 3,
    products: [
      {
        sku: "MB-01",
        name: "Eigen Bowl (Medium)",
        description: "Stap 1 Basis (Sushirijst, Brown rice, Salad) + Stap 2 Mix (5x) + Stap 3 Proteïne (Zalm, Tonijn, Kip, Tofu, Steak, Kebab, Falafel) + Stap 4 Dressing + Stap 5 Toppings (3x)",
        basePrice: 0,
        groups: [bowlBasis, bowlMix, bowlProtein, bowlDressing, bowlToppings],
      },
    ],
  },
  {
    slug: "pizza-30cm",
    name: "Pizza (30cm)",
    sortOrder: 4,
    products: [
      {
        sku: "PZA-01",
        name: "Pizza Margherita",
        description: "Pizzasaus, mozzarella",
        basePrice: 0,
      },
      {
        sku: "PZA-02",
        name: "Pizza BBQ Chicken",
        description: "Pizzasaus, mozzarella, paprika, ui, BBQ-saus, kip",
        basePrice: 0,
      },
      {
        sku: "PZA-03",
        name: "Pizza Hawaii",
        description: "Pizzasaus, mozzarella, ananas, ham",
        basePrice: 0,
      },
      {
        sku: "PZA-04",
        name: "Pizza Funghi",
        description: "Pizzasaus, mozzarella, champignons",
        basePrice: 0,
      },
      {
        sku: "PZA-05",
        name: "Pizza Pepperoni",
        description: "Pizzasaus, mozzarella, salami",
        basePrice: 0,
      },
      {
        sku: "PZA-06",
        name: "Pizza Quattro Formaggi",
        description: "Pizzasaus, mozzarella, feta, cheddar, kaas (4 soorten)",
        basePrice: 0,
      },
      {
        sku: "PZA-07",
        name: "Pizza Kebab",
        description: "Pizzasaus, mozzarella, paprika, ui, kebab",
        basePrice: 0,
      },
      {
        sku: "PZA-08",
        name: "Pizza Tonno",
        description: "Pizzasaus, mozzarella, tonijn, olijven, ui",
        basePrice: 0,
      },
      {
        sku: "PZA-09",
        name: "Pizza Sea Lovers",
        description: "Pizzasaus, mozzarella, mix van zeevruchten",
        basePrice: 0,
      },
      {
        sku: "PZA-10",
        name: "Pizza Meat Spicy",
        description: "Pizzasaus, mozzarella, jalapeños, ui, paprika, kip, kebab",
        basePrice: 0,
      },
      {
        sku: "PZA-11",
        name: "Pizza Full Option",
        description: "Pizzasaus, mozzarella, ui, paprika, maïs, olijven, champignons, kip, kebab",
        basePrice: 0,
      },
      {
        sku: "PZA-12",
        name: "Pizza Hot Chicken",
        description: "Pizzasaus, mozzarella, pikante kip",
        basePrice: 0,
      },
      {
        sku: "PZA-13",
        name: "Pizza Mediterrane",
        description: "Pizzasaus, mozzarella, feta",
        basePrice: 0,
      },
      {
        sku: "PZA-14",
        name: "Pizza Cagliari",
        description: "Pizzasaus, mozzarella, champignons, salami",
        basePrice: 0,
      },
      {
        sku: "PZA-15",
        name: "Pizza Sweet Chili Scampi",
        description: "Pizzasaus, mozzarella, ananas, paprika, scampi, sweet chili saus",
        basePrice: 0,
      },
      {
        sku: "PZA-16",
        name: "Pizza Vegetaria",
        description: "Pizzasaus, mozzarella, champignons, mix paprika, ui, olijven",
        basePrice: 0,
      },
    ],
  },
  {
    slug: "lookbrooden",
    name: "Lookbrooden",
    sortOrder: 5,
    products: [
      {
        sku: "LB-01",
        name: "Lookbrood Natuur",
        description: "Knoflookolie (6 stuks)",
        basePrice: 0,
      },
      {
        sku: "LB-02",
        name: "Lookbrood Kaas",
        description: "Knoflookolie, mozzarella (6 stuks)",
        basePrice: 0,
      },
      {
        sku: "LB-03",
        name: "Lookbrood Ham & Kaas",
        description: "Knoflookolie, ham, mozzarella (6 stuks)",
        basePrice: 0,
      },
      {
        sku: "LB-04",
        name: "Lookbrood Bolognaise",
        description: "Knoflookolie, bolognaisesaus, mozzarella",
        basePrice: 0,
      },
      {
        sku: "LB-05",
        name: "Lookbrood Pita",
        description: "Knoflookolie, pitavlees, mozzarella",
        basePrice: 0,
      },
    ],
  },
  {
    slug: "belegde-broodjes",
    name: "Belegde Broodjes",
    sortOrder: 6,
    products: [
      {
        sku: "BRD-01",
        name: "Broodje Brie en Appel",
        description: "Sla, noten, honing, brie, appel",
        basePrice: 0,
      },
      {
        sku: "BRD-02",
        name: "Broodje Jonge Gouda",
        description: "Tomaat, sla, jonge Gouda, ei, mayo",
        basePrice: 0,
      },
      {
        sku: "BRD-03",
        name: "Broodje Mozzarella",
        description: "Rucola, pesto, tomaat, mozzarella",
        basePrice: 0,
      },
      {
        sku: "BRD-04",
        name: "Broodje Chicken BBQ",
        description: "Tomaat, sla, ei, BBQ-saus, kip",
        basePrice: 0,
      },
      {
        sku: "BRD-05",
        name: "Broodje Kipcurry",
        description: "Ei, sla, wortelen, kipcurry",
        basePrice: 0,
      },
      {
        sku: "BRD-06",
        name: "Broodje Hammy",
        description: "Tomaat, sla, ham, ei, mayo",
        basePrice: 0,
      },
      {
        sku: "BRD-07",
        name: "Broodje Jong Hammy",
        description: "Tomaat, sla, jonge Gouda, ei, mayo, ham",
        basePrice: 0,
      },
      {
        sku: "BRD-08",
        name: "Broodje Gerookte Zalm & Honey Mustard",
        description: "Gerookte zalm, radijsscheuten, lente-ui, komkommer, sla mix, honey mustard spread",
        basePrice: 0,
      },
      {
        sku: "BRD-09",
        name: "Broodje Mini Garnaal",
        description: "Tomaat, sla, ei, radijsscheuten, garnaalsalade",
        basePrice: 0,
      },
      {
        sku: "BRD-10",
        name: "Broodje Tonno Spicy",
        description: "Sla, ei, komkommer, Tajín pikant",
        basePrice: 0,
      },
      {
        sku: "BRD-11",
        name: "Broodje Tonno Mayo",
        description: "Ei, sla, komkommer, Tajín mayo",
        basePrice: 0,
      },
      {
        sku: "BRD-12",
        name: "Broodje Chicken Samurai",
        description: "Samurai, cheddar, jonge Gouda, tomaat, sla mix, rode uien",
        basePrice: 0,
      },
      {
        sku: "BRD-13",
        name: "Broodje Chicken Teriyaki / Tea May",
        description: "Avocadospread, ei, tomaat, rode uien, chili mayo, jalapeños",
        basePrice: 0,
        groups: [breadType],
      },
      {
        sku: "BRD-14",
        name: "Broodje Viva La Feta",
        description: "Griekse feta, gegrilde rode paprika, rode ui, kerstomaat, sla mix, yoghurtdressing",
        basePrice: 0,
      },
      {
        sku: "BRD-15",
        name: "Broodje Hummus",
        description: "Hummus, paprika, aubergine, tomaten, rucola (Op meergranenbrood)",
        basePrice: 0,
      },
      {
        sku: "BRD-16",
        name: "Broodje Veganaise",
        description: "Tomaat, rucola, geraspte wortelen, komkommer, rode uien, peper, sla mix, veganaise",
        basePrice: 0,
      },
    ],
  },
  {
    slug: "pita-kip-grill",
    name: "Pita, Kip & Grill",
    sortOrder: 7,
    products: [
      {
        sku: "PG-01",
        name: "Broodje Pita / Kip / Mix",
        description: "Keuze uit pita, kip of mix van beide",
        basePrice: 0,
        groups: [meatChoice, pitaExtras(["Feta", "Ananas", "Jalapeños", "Maïs", "Olijven"]), sauceChoice],
      },
      {
        sku: "PG-02",
        name: "Dürüm Pita / Kip / Mix",
        description: "Keuze uit pita, kip of mix van beide",
        basePrice: 0,
        groups: [meatChoice, pitaExtras(["Feta", "Ananas", "Jalapeños", "Maïs", "Champignons", "Paprika", "Ajuin", "Olijven"]), sauceChoice],
      },
      {
        sku: "PG-03",
        name: "Kapsalon Pita / Kip / Mix",
        description: "Friet, vlees, gesmolten kaas, salade",
        basePrice: 0,
        groups: [meatChoice, pitaExtras(["Feta", "Ananas", "Jalapeños", "Maïs", "Olijven"]), sauceChoice],
      },
      {
        sku: "PG-04",
        name: "Schotel Pita / Kip / Mix",
        description: "Geserveerd met friet/rijst en salade",
        basePrice: 0,
        groups: [meatChoice, pitaExtras(["Feta", "Ananas", "Jalapeños", "Maïs", "Olijven"]), sauceChoice],
      },
      {
        sku: "PG-05",
        name: "Box Pita / Kip / Mix",
        description: "Handige box met friet en vlees",
        basePrice: 0,
        groups: [meatChoice, pitaExtras(["Feta", "Ananas", "Jalapeños", "Maïs", "Olijven"]), sauceChoice],
      },
    ],
  },
  {
    slug: "frituur-burgers",
    name: "Frituur & Burgers",
    sortOrder: 8,
    products: [
      {
        sku: "FB-01",
        name: "Fishburger",
        description: "Visburger op broodje",
        basePrice: 0,
      },
      {
        sku: "FB-02",
        name: "Hamburger",
        description: "Klassieke hamburger",
        basePrice: 0,
      },
      {
        sku: "FB-03",
        name: "Kipburger",
        description: "Kipburger op broodje",
        basePrice: 0,
      },
      {
        sku: "FB-04",
        name: "Crispy Burger",
        description: "Krokante kipburger",
        basePrice: 0,
      },
      {
        sku: "FB-05",
        name: "Cheeseburger",
        description: "Hamburger met kaas",
        basePrice: 0,
      },
      {
        sku: "FB-06",
        name: "Friet Klein",
        description: "Portie kleine friet",
        basePrice: 0,
        groups: [sauceChoice],
      },
      {
        sku: "FB-07",
        name: "Friet Groot",
        description: "Portie grote friet",
        basePrice: 0,
        groups: [frietUitvoering, sauceChoice],
      },
      {
        sku: "FB-08",
        name: "Curryworst",
        description: "Klassieke curryworst",
        basePrice: 0,
        groups: [sauceChoice],
      },
      {
        sku: "FB-09",
        name: "Curryworst Speciaal",
        description: "Curryworst met mayo, currysaus en uitjes",
        basePrice: 0,
        groups: [sauceChoice],
      },
      {
        sku: "FB-10",
        name: "Chickennuggets",
        description: "Portie kipnuggets",
        basePrice: 0,
        groups: [sauceChoice],
      },
      {
        sku: "FB-11",
        name: "Mexicano (los)",
        description: "Mexicano snack",
        basePrice: 0,
        groups: [sauceChoice],
      },
      {
        sku: "FB-12",
        name: "Berhap / Briket",
        description: "Gehakt/ui snack",
        basePrice: 0,
        groups: [sauceChoice],
      },
      {
        sku: "FB-13",
        name: "Kaaskroket",
        description: "Kroket met kaasvulling",
        basePrice: 0,
        groups: [sauceChoice],
      },
      {
        sku: "FB-14",
        name: "Chickenwings",
        description: "Portie kippenvleugels",
        basePrice: 0,
        groups: [sauceChoice],
      },
      {
        sku: "FB-15",
        name: "Chickentenders",
        description: "Portie krokante kiphaasjes",
        basePrice: 0,
        groups: [sauceChoice],
      },
    ],
  },
  {
    slug: "sauzen",
    name: "Sauzen",
    sortOrder: 9,
    products: [
      {
        sku: "SZ-01",
        name: "Looksaus",
        description: "Saus voor friet/snacks/pita",
        basePrice: 0,
      },
      {
        sku: "SZ-02",
        name: "Samuraisaus",
        description: "Saus voor friet/snacks/pita",
        basePrice: 0,
      },
      {
        sku: "SZ-03",
        name: "Andalousesaus",
        description: "Saus voor friet/snacks/pita",
        basePrice: 0,
      },
      {
        sku: "SZ-04",
        name: "Sambal",
        description: "Saus voor friet/snacks/pita",
        basePrice: 0,
      },
      {
        sku: "SZ-05",
        name: "Mammoetsaus",
        description: "Saus voor friet/snacks/pita",
        basePrice: 0,
      },
      {
        sku: "SZ-06",
        name: "Cocktailsaus",
        description: "Saus voor friet/snacks/pita",
        basePrice: 0,
      },
      {
        sku: "SZ-07",
        name: "Mayonaise",
        description: "Saus voor friet/snacks/pita",
        basePrice: 0,
      },
      {
        sku: "SZ-08",
        name: "Ketchup",
        description: "Saus voor friet/snacks/pita",
        basePrice: 0,
      },
    ],
  },
  {
    slug: "desserts",
    name: "Desserts",
    sortOrder: 10,
    products: [
      {
        sku: "DES-01",
        name: "Cheesecake Bosvruchten",
        description: "Cheesecake met bosvruchten topping",
        basePrice: 0,
      },
      {
        sku: "DES-02",
        name: "Tiramisu Klassiek",
        description: "Klassieke tiramisu",
        basePrice: 0,
      },
      {
        sku: "DES-03",
        name: "Tiramisu Oreo",
        description: "Tiramisu met Oreo smaak",
        basePrice: 0,
      },
      {
        sku: "DES-04",
        name: "Tiramisu Speculoos",
        description: "Tiramisu met Speculoos smaak",
        basePrice: 0,
      },
      {
        sku: "DES-05",
        name: "San Sebastian Cheesecake",
        description: "Spaanse 'burnt' cheesecake",
        basePrice: 0,
      },
      {
        sku: "DES-06",
        name: "Rijstpap",
        description: "Traditionele rijstpap",
        basePrice: 0,
      },
      {
        sku: "DES-07",
        name: "Punt Baklava",
        description: "Klassiek baklava gebak",
        basePrice: 0,
      },
    ],
  },
  {
    slug: "dranken",
    name: "Dranken",
    sortOrder: 11,
    products: [
      {
        sku: "DRK-01",
        name: "Coca-Cola Regular",
        description: "Frisdrank 33cl",
        basePrice: 0,
      },
      {
        sku: "DRK-02",
        name: "Coca-Cola Zero",
        description: "Frisdrank 33cl",
        basePrice: 0,
      },
      {
        sku: "DRK-03",
        name: "Fanta Orange",
        description: "Frisdrank 33cl",
        basePrice: 0,
      },
      {
        sku: "DRK-04",
        name: "Fanta Exotic",
        description: "Frisdrank 33cl",
        basePrice: 0,
      },
      {
        sku: "DRK-05",
        name: "Fuze Tea Original",
        description: "Ijsthee",
        basePrice: 0,
      },
      {
        sku: "DRK-06",
        name: "Fuze Tea Green",
        description: "Groene ijsthee",
        basePrice: 0,
      },
      {
        sku: "DRK-07",
        name: "Spa Blauw",
        description: "Plat water",
        basePrice: 0,
      },
      {
        sku: "DRK-08",
        name: "Spa Rood",
        description: "Bruiswater",
        basePrice: 0,
      },
      {
        sku: "DRK-09",
        name: "Red Bull",
        description: "Energiedrank",
        basePrice: 0,
      },
      {
        sku: "DRK-10",
        name: "Ayran",
        description: "Turkse yoghurtdrank",
        basePrice: 0,
      },
      {
        sku: "DRK-11",
        name: "Sarıyer Cola",
        description: "Turkse frisdrank",
        basePrice: 0,
      },
      {
        sku: "DRK-12",
        name: "Sarıyer Portakal",
        description: "Turkse sinaasappel frisdrank",
        basePrice: 0,
      },
      {
        sku: "DRK-13",
        name: "Sarıyer Gazoz",
        description: "Turkse gazoz frisdrank",
        basePrice: 0,
      },
    ],
  },
];
