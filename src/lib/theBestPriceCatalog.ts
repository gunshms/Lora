import type { RecipeIngredient, StockItem } from "@/context/AdegaContext";

export const THE_BEST_PRICE_CATALOG_VERSION = "2026-07-15";

type RecipePart = {
  aliases: string[];
  quantity: number;
};

type CatalogEntry = {
  name: string;
  aliases?: string[];
  priceCost?: number;
  priceSell?: number;
  renameExisting?: boolean;
  isReturnable?: boolean;
  recipe?: RecipePart[];
};

export type PriceCatalogApplyResult = {
  stock: StockItem[];
  changedIds: string[];
  created: number;
  updated: number;
};

const normalizeName = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");

const makeId = (name: string) =>
  `menu-${normalizeName(name).replace(/\s+/g, "-").slice(0, 60)}`;

const ingredientEntries: CatalogEntry[] = [
  { name: "Vodka Smirnoff Red 1L", aliases: ["Smirnoff", "Vodka Smirnoff Red 1L"], priceCost: 30 },
  { name: "Gin Eternity 900ml", aliases: ["Gin Eternity", "Gin Eternity 900ml"], priceCost: 15.84 },
  { name: "Vodka Askov Tradicional 900ml", aliases: ["Askov", "Vodka Askov Tradicional 1L", "Vodka Askov Tradicional 900ml"], priceCost: 15, renameExisting: true },
  { name: "Gin Tanqueray London Dry 750ml", aliases: ["Gin Tanqueray", "Gin Tanqueray London Dry 750ml"], priceCost: 92 },
  { name: "Gin Beefeater London Dry 750ml", aliases: ["Beefeater Gin", "Gin Beefeater London Dry 750ml"], priceCost: 75 },
  { name: "Whisky Johnnie Walker Red Label 1L", aliases: ["Red Label", "Whisky Johnnie Walker Red Label 1L"], priceCost: 79 },
  { name: "Whisky Jack Daniel's Old No.7 1L", aliases: ["Jack Daniel's Tradicional", "Whisky Jack Daniel's Old No.7 1L"], priceCost: 115 },
  { name: "Whisky Jack Daniel's Apple 1L", aliases: ["Jack Daniel's Maçã Verde", "Whisky Jack Daniel's Apple (Maçã Verde) 1L", "Whisky Jack Daniel's Apple 1L"], priceCost: 125, renameExisting: true },
  { name: "Vodka Absolut Regular 1L", aliases: ["Absolut Tradicional", "Vodka Absolut Regular 1L"], priceCost: 70 },
  { name: "Whisky White Horse 1L", aliases: ["White Horse", "Whisky White Horse 1L"], priceCost: 60 },
  { name: "Whisky Passport Scotch 1L", aliases: ["Passport", "Whisky Passport Scotch 1L"], priceCost: 42 },
  { name: "Licor Malibu 750ml", aliases: ["Malibu", "Licor Malibu 750ml"], priceCost: 55 },
  { name: "Cachaça Velho Barreiro 910ml", aliases: ["Velho Barreiro", "Aperitivo Velho Barreiro Cachaça 910ml", "Cachaça Velho Barreiro 910ml"], priceCost: 17, renameExisting: true },
  { name: "Energético Baly 2L", aliases: ["Baly", "Baly 2L", "Energético Bali Energy Drink 2L", "Energético Baly 2L"], priceCost: 9, priceSell: 14.99, renameExisting: true },
  { name: "Energético Red Bull 250ml", aliases: ["Red Bull", "Red Bull 250 ml", "Energético Red Bull Energy Drink 250ml", "Energético Red Bull 250ml"], priceCost: 7.7, priceSell: 12.99, renameExisting: true },
  { name: "Energético Monster 473ml", aliases: ["Monster", "Monster 473 ml", "Energético Monster 473ml"], priceCost: 6.89, priceSell: 11.99 },
  { name: "Gelo saborizado (unidade)", aliases: ["Gelo saborizado", "Gelo saborizado (unidade)"], priceCost: 1, priceSell: 1.99 },
  { name: "Copo descartável (unidade)", aliases: ["Copo descartável", "Copo descartável (unidade)"], priceCost: 0.5, priceSell: 1.5 },
];

const menuEntries: CatalogEntry[] = [
  { name: "Refrigerante Coca-Cola Pet 2L", aliases: ["Coca-Cola 2L", "Refrigerante Coca-Cola Pet 2L"], priceSell: 13 },
  { name: "Refrigerante Coca-Cola Lata 350ml", aliases: ["Coca-Cola lata", "Refrigerante Coca-Cola Lata 350ml"], priceSell: 5 },
  { name: "Refrigerante Coca-Cola Zero Pet 2L", aliases: ["Coca-Cola Zero 2L", "Refrigerante Coca-Cola Sem Açúcar Pet 2L", "Refrigerante Coca-Cola Zero Pet 2L"], priceSell: 13, renameExisting: true },
  { name: "Refrigerante Sprite Lata 350ml", aliases: ["Sprite lata", "Refrigerante Sprite Lata 350ml"], priceSell: 4.5 },
  { name: "Refrigerante Schweppes Lata 350ml", aliases: ["Schweppes lata", "Refrigerante Schweppes Lata 350ml"], priceSell: 4.5 },
  { name: "Água Tônica Antarctica Lata 350ml", aliases: ["Água tônica lata", "Água Tônica Antarctica Lata 350ml"], priceSell: 4.5 },
  { name: "Água Mineral Sem Gás 500ml", aliases: ["Água 500 ml", "Água Mineral Sem Gás 500ml"], priceSell: 3 },

  { name: "Cerveja Budweiser Retornável 1L", aliases: ["Budweiser Retornável 1L", "Cerveja Budweiser Retornável 1L"], priceCost: 7.4, priceSell: 16.99, isReturnable: true },
  { name: "Cerveja Original Retornável 1L", aliases: ["Original Retornável 1L", "Cerveja Original Retornável 1L"], priceCost: 8.865833333, priceSell: 17.99, isReturnable: true },
  { name: "Cerveja Brahma Duplo Malte Retornável 1L", aliases: ["Brahma Duplo Malte Retornável 1L", "Cerveja Brahma Duplo Malte Retornável 1L"], priceCost: 7.4, priceSell: 15.99, isReturnable: true },
  { name: "Cerveja Skol Litrão 1L (Retornável)", aliases: ["Skol Pilsen Retornável 1L", "Cerveja Skol Litrão 1L (Retornável)"], priceCost: 7.09, priceSell: 14.99, isReturnable: true },
  { name: "Cerveja Skol Lata 269ml", aliases: ["Skol Pilsen 269", "Cerveja Skol Lata 269ml"], priceCost: 2.36, priceSell: 2.99 },
  { name: "Cerveja Skol Lata 350ml", aliases: ["Skol Pilsen 350", "Cerveja Skol Lata 350ml"], priceCost: 2.99, priceSell: 3.59 },
  { name: "Cerveja Brahma Chopp Lata 350ml", aliases: ["Brahma Chopp 350", "Cerveja Brahma Chopp Lata 350ml"], priceCost: 2.773333333, priceSell: 3.79 },
  { name: "Cerveja Original Lata 350ml", aliases: ["Original 350", "Cerveja Original Lata 350ml"], priceCost: 4.073333333, priceSell: 4.89 },
  { name: "Cerveja Bohemia Lata 350ml", aliases: ["Bohemia 350", "Cerveja Bohemia Lata 350ml"], priceCost: 3.6, priceSell: 4.79 },
  { name: "Cerveja Spaten Lata 350ml", aliases: ["Spaten 350", "Cerveja Spaten Lata 350ml"], priceCost: 3.09, priceSell: 4.79 },
  { name: "Cerveja Budweiser Lata 269ml", aliases: ["Budweiser 269", "Cerveja Budweiser Lata 269ml"], priceCost: 2.92, priceSell: 3.39 },
  { name: "Cerveja Budweiser Lata 350ml", aliases: ["Budweiser 350", "Cerveja Budweiser Lata 350ml"], priceCost: 3.5, priceSell: 4.29 },
  { name: "Cerveja Budweiser Zero Lata 350ml", aliases: ["Budweiser Zero 350", "Cerveja Budweiser Zero Lata 350ml"], priceCost: 3.69, priceSell: 5.99 },
  { name: "Cerveja Brahma Duplo Malte Lata 269ml", aliases: ["Brahma Duplo Malte 269", "Cerveja Brahma Duplo Malte Lata 269ml"], priceCost: 2.85, priceSell: 3.39 },
  { name: "Cerveja Brahma Duplo Malte Lata 350ml", aliases: ["Brahma Duplo Malte 350", "Cerveja Brahma Duplo Malte Lata 350ml"], priceCost: 3.5, priceSell: 4.19 },
  { name: "Cerveja Beck's Lata 350ml", aliases: ["Beck's 350", "Cerveja Beck's Lata 350ml"], priceCost: 4.85, priceSell: 7.49 },
  { name: "Cerveja Colorado Ribeirão Lager Lata 350ml", aliases: ["Colorado Ribeirão Lager 350", "Cerveja Colorado Ribeirão Lager Lata 350ml"], priceCost: 4.144166667, priceSell: 7.99 },
  { name: "Cerveja Corona Extra Long Neck 330ml", aliases: ["Corona Extra", "Cerveja Corona Extra Long Neck 330ml"], priceCost: 6.591666667, priceSell: 8.49 },
  { name: "Smirnoff Ice 269ml", aliases: ["Smirnoff Ice garrafinha", "Smirnoff Ice 269ml"], priceCost: 5.6, priceSell: 12 },
  { name: "Skol Beats Senses 269ml", aliases: ["Skol Beats / Beats Senses", "Skol Beats Senses Garrafa Long Neck 269ml", "Skol Beats Senses 269ml"], priceCost: 3.395, priceSell: 7 },
  { name: "Skol Beats GT Gin & Tonic Lata 269ml", aliases: ["Beats GT 269", "Skol Beats GT Gin & Tonic Lata 269ml"], priceCost: 5.1925, priceSell: 8.5 },
  { name: "Xeque Mate Rum, Guaraná e Limão 362ml", aliases: ["Checkmate / Xeque Mate 362", "Xeque Mate Rum, Guaraná e Limão 362ml"], priceCost: 9.49, priceSell: 15 },

  { name: "Caipirinha de Limão - Askov 200ml", aliases: ["Caipirinha de Limão - Askov 200ml", "Caipirinha de Limão — Askov"], priceCost: 3.848606667, priceSell: 14.99 },
  { name: "Caipirinha de Limão - Velho Barreiro 200ml", aliases: ["Caipirinha de Limão - Velho Barreiro 200ml", "Caipirinha de Limão — Velho Barreiro"], priceCost: 4.050071868, priceSell: 14.99 },
  { name: "Dose Velho Barreiro com limão", priceCost: 3.368131868, priceSell: 4.5 },
  { name: "Gin com tônica", priceCost: 5.82, priceSell: 14.99 },
  { name: "Batata frita - Pequena", aliases: ["Batata frita — Pequena", "Batata frita - Pequena"], priceCost: 2.7, priceSell: 14.99 },
  { name: "Batata frita - Grande", aliases: ["Batata frita — Grande", "Batata frita - Grande"], priceCost: 5.4, priceSell: 20.99 },
  { name: "Batata suprema", priceCost: 5.4, priceSell: 27.99 },
  { name: "Paiero", priceCost: 9, priceSell: 13 },
  { name: "Tabaquinho", priceCost: 9, priceSell: 15 },
  { name: "Crema", priceCost: 12, priceSell: 17 },
  { name: "Seda unidade", priceSell: 5 },
  { name: "Cuia", priceSell: 15 },
  { name: "Tesoura", priceSell: 17 },
  { name: "Piteira", priceSell: 6 },
  { name: "Isqueiro Bic Maxi", aliases: ["Isqueiro", "Isqueiro Bic Maxi"], priceSell: 4 },
  { name: "Rosh de narguilé pronto para fumar", priceSell: 12.99 },
];

const spiritCombos = [
  { name: "Smirnoff", aliases: ["Vodka Smirnoff Red 1L"], dose: 0.1, costs: [6.075, 11.39, 12.2], prices: [16.99, 26.99, 29.99] },
  { name: "Gin Eternity", aliases: ["Gin Eternity 900ml"], dose: 100 / 900, costs: [4.835, 10.15, 10.96], prices: [10, 20, 23] },
  { name: "Askov", aliases: ["Vodka Askov Tradicional 900ml"], dose: 100 / 900, costs: [4.741666667, 10.05666667, 10.86666667], prices: [13.99, 23.99, 26.99] },
  { name: "Gin Tanqueray", aliases: ["Gin Tanqueray London Dry 750ml"], dose: 100 / 750, costs: [15.34166667, 20.65666667, 21.46666667], prices: [29.99, 39.99, 42.99] },
  { name: "Beefeater Gin", aliases: ["Gin Beefeater London Dry 750ml"], dose: 100 / 750, costs: [13.075, 18.39, 19.2], prices: [26.99, 36.99, 39.99] },
  { name: "Red Label", aliases: ["Whisky Johnnie Walker Red Label 1L"], dose: 0.1, costs: [10.975, 16.29, 17.1], prices: [23.99, 33.99, 36.99] },
  { name: "Jack Daniel's Tradicional", aliases: ["Whisky Jack Daniel's Old No.7 1L"], dose: 0.1, costs: [14.575, 19.89, 20.7], prices: [28.99, 38.99, 41.99] },
  { name: "Jack Daniel's Maçã Verde", aliases: ["Whisky Jack Daniel's Apple 1L"], dose: 0.1, costs: [15.575, 20.89, 21.7], prices: [29.99, 39.99, 42.99] },
  { name: "Absolut Tradicional", aliases: ["Vodka Absolut Regular 1L"], dose: 0.1, costs: [10.075, 15.39, 16.2], prices: [22.99, 32.99, 35.99] },
  { name: "White Horse", aliases: ["Whisky White Horse 1L"], dose: 0.1, costs: [9.075, 14.39, 15.2], prices: [18.99, 28.99, 31.99] },
  { name: "Passport", aliases: ["Whisky Passport Scotch 1L"], dose: 0.1, costs: [7.275, 12.59, 13.4], prices: [15.99, 25.99, 28.99] },
  { name: "Malibu", aliases: ["Licor Malibu 750ml"], dose: 100 / 750, costs: [10.40833333, 15.72333333, 16.53333333], prices: [20.99, 30.99, 33.99] },
];

const energyOptions = [
  { name: "Baly", aliases: ["Energético Baly 2L"], quantity: 350 / 2000 },
  { name: "Monster", aliases: ["Energético Monster 473ml"], quantity: 1 },
  { name: "Red Bull", aliases: ["Energético Red Bull 250ml"], quantity: 1 },
];

const comboEntries: CatalogEntry[] = spiritCombos.flatMap((spirit) =>
  energyOptions.map((energy, index) => ({
    name: `Copão ${spirit.name} com ${energy.name} - dose 100ml`,
    priceCost: spirit.costs[index],
    priceSell: spirit.prices[index],
    recipe: [
      { aliases: spirit.aliases, quantity: spirit.dose },
      { aliases: energy.aliases, quantity: energy.quantity },
      { aliases: ["Gelo saborizado (unidade)"], quantity: 1 },
      { aliases: ["Copo descartável (unidade)"], quantity: 1 },
    ],
  }))
);

export const THE_BEST_PRICE_CATALOG = [
  ...ingredientEntries,
  ...menuEntries,
  ...comboEntries,
];

const entryNames = (entry: CatalogEntry) => [entry.name, ...(entry.aliases || [])].map(normalizeName);

const findByAliases = (items: StockItem[], aliases: string[]) => {
  const normalizedAliases = aliases.map(normalizeName);
  return items.find((item) => normalizedAliases.includes(normalizeName(item.name)));
};

const sameRecipe = (left?: RecipeIngredient[], right?: RecipeIngredient[]) =>
  JSON.stringify(left || []) === JSON.stringify(right || []);

export function applyTheBestPriceCatalog(currentStock: StockItem[]): PriceCatalogApplyResult {
  const nextStock = currentStock.map((item) => ({ ...item }));
  const changedIds = new Set<string>();
  let created = 0;
  let updated = 0;

  for (const entry of THE_BEST_PRICE_CATALOG) {
    const names = entryNames(entry);
    let item = nextStock.find((candidate) => names.includes(normalizeName(candidate.name)));

    if (!item) {
      item = {
        id: makeId(entry.name),
        name: entry.name,
        quantity: 0,
        status: "planned",
        price_cost: entry.priceCost || 0,
        price_sell: entry.priceSell || 0,
        price_history: [],
        recipe: [],
        is_returnable: entry.isReturnable,
        deposit_fee: entry.isReturnable ? 0 : undefined,
        batches: [],
      };
      nextStock.push(item);
      changedIds.add(item.id);
      created += 1;
      continue;
    }

    const nextCost = entry.priceCost ?? item.price_cost ?? 0;
    const nextSell = entry.priceSell ?? item.price_sell ?? 0;
    const nextName = entry.renameExisting ? entry.name : item.name;
    const nextReturnable = entry.isReturnable ?? item.is_returnable;
    const changed =
      item.price_cost !== nextCost ||
      item.price_sell !== nextSell ||
      item.name !== nextName ||
      item.is_returnable !== nextReturnable;

    if (changed) {
      const history = [...(item.price_history || [])];
      const latest = history[history.length - 1];
      if (!latest || latest.date !== THE_BEST_PRICE_CATALOG_VERSION || latest.cost !== nextCost || latest.sell !== nextSell) {
        history.push({ date: THE_BEST_PRICE_CATALOG_VERSION, cost: nextCost, sell: nextSell });
      }

      Object.assign(item, {
        name: nextName,
        price_cost: nextCost,
        price_sell: nextSell,
        price_history: history,
        is_returnable: nextReturnable,
        deposit_fee: entry.isReturnable ? item.deposit_fee || 0 : item.deposit_fee,
      });
      changedIds.add(item.id);
      updated += 1;
    }
  }

  for (const entry of comboEntries) {
    const item = findByAliases(nextStock, [entry.name]);
    if (!item || !entry.recipe) continue;

    const recipe = entry.recipe
      .map((part) => {
        const ingredient = findByAliases(nextStock, part.aliases);
        return ingredient ? { product_id: ingredient.id, quantity: part.quantity } : null;
      })
      .filter((part): part is RecipeIngredient => part !== null);

    if (recipe.length === entry.recipe.length && !sameRecipe(item.recipe, recipe)) {
      item.recipe = recipe;
      changedIds.add(item.id);
      if (!currentStock.some((candidate) => candidate.id === item.id)) {
        continue;
      }
      updated += 1;
    }
  }

  return {
    stock: nextStock,
    changedIds: [...changedIds],
    created,
    updated,
  };
}
