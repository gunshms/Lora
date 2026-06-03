export interface ProductImageItem {
  name: string;
  image_url?: string | null;
  barcode?: string | null;
}

interface BrandSpec {
  match: RegExp;
  label: string;
  bg: string;
  fg: string;
  accent: string;
  kind?: "beer" | "soda" | "energy" | "spirit" | "wine" | "water" | "snack" | "smoke" | "ice" | "utility";
}

const brandSpecs: BrandSpec[] = [
  { match: /heineken/i, label: "HEINEKEN", bg: "#064E3B", fg: "#F7F7F2", accent: "#D6111E", kind: "beer" },
  { match: /amstel/i, label: "AMSTEL", bg: "#B91C1C", fg: "#FFF7D6", accent: "#FACC15", kind: "beer" },
  { match: /brahma duplo/i, label: "BRAHMA DUPLO", bg: "#B45309", fg: "#FFF4CF", accent: "#FDE047", kind: "beer" },
  { match: /brahma/i, label: "BRAHMA", bg: "#B91C1C", fg: "#FFFFFF", accent: "#FACC15", kind: "beer" },
  { match: /skol beats/i, label: "SKOL BEATS", bg: "#2563EB", fg: "#FFFFFF", accent: "#EC4899", kind: "energy" },
  { match: /skol/i, label: "SKOL", bg: "#FACC15", fg: "#7F1D1D", accent: "#DC2626", kind: "beer" },
  { match: /bohemia/i, label: "BOHEMIA", bg: "#7C2D12", fg: "#FFF7D6", accent: "#D97706", kind: "beer" },
  { match: /original/i, label: "ORIGINAL", bg: "#92400E", fg: "#FFF7D6", accent: "#F59E0B", kind: "beer" },
  { match: /itaipava/i, label: "ITAIPAVA", bg: "#B91C1C", fg: "#FFFFFF", accent: "#FDE047", kind: "beer" },
  { match: /budweiser/i, label: "BUDWEISER", bg: "#B91C1C", fg: "#FFFFFF", accent: "#F8FAFC", kind: "beer" },
  { match: /corona/i, label: "CORONA", bg: "#FACC15", fg: "#1E3A8A", accent: "#FFFFFF", kind: "beer" },
  { match: /sol long/i, label: "SOL", bg: "#F97316", fg: "#FFFFFF", accent: "#FDE047", kind: "beer" },
  { match: /spaten/i, label: "SPATEN", bg: "#065F46", fg: "#FFF7D6", accent: "#FACC15", kind: "beer" },
  { match: /stella/i, label: "STELLA ARTOIS", bg: "#991B1B", fg: "#FFF7D6", accent: "#D4AF37", kind: "beer" },
  { match: /coca-cola sem|coca cola sem/i, label: "COCA-COLA ZERO", bg: "#111827", fg: "#FFFFFF", accent: "#DC2626", kind: "soda" },
  { match: /coca-cola|coca cola/i, label: "COCA-COLA", bg: "#B91C1C", fg: "#FFFFFF", accent: "#F8FAFC", kind: "soda" },
  { match: /guarana antarctica|antarctica/i, label: "GUARANA", bg: "#16A34A", fg: "#FFFFFF", accent: "#FACC15", kind: "soda" },
  { match: /fanta uva/i, label: "FANTA UVA", bg: "#7E22CE", fg: "#FFFFFF", accent: "#C4B5FD", kind: "soda" },
  { match: /fanta/i, label: "FANTA", bg: "#F97316", fg: "#FFFFFF", accent: "#22C55E", kind: "soda" },
  { match: /pepsi/i, label: "PEPSI", bg: "#1D4ED8", fg: "#FFFFFF", accent: "#EF4444", kind: "soda" },
  { match: /sprite/i, label: "SPRITE", bg: "#16A34A", fg: "#FFFFFF", accent: "#FDE047", kind: "soda" },
  { match: /agua tonica/i, label: "TONICA ANTARCTICA", bg: "#155E75", fg: "#FFFFFF", accent: "#22D3EE", kind: "soda" },
  { match: /red bull ruby/i, label: "RED BULL RUBY", bg: "#BE185D", fg: "#FFFFFF", accent: "#F9A8D4", kind: "energy" },
  { match: /red bull red/i, label: "RED BULL RED", bg: "#B91C1C", fg: "#FFFFFF", accent: "#60A5FA", kind: "energy" },
  { match: /red bull summer/i, label: "RED BULL SUMMER", bg: "#F97316", fg: "#FFFFFF", accent: "#FDE047", kind: "energy" },
  { match: /red bull tropical/i, label: "RED BULL TROPICAL", bg: "#FACC15", fg: "#172554", accent: "#2563EB", kind: "energy" },
  { match: /red bull/i, label: "RED BULL", bg: "#1E3A8A", fg: "#FFFFFF", accent: "#FACC15", kind: "energy" },
  { match: /vibe/i, label: "VIBE ENERGY", bg: "#7E22CE", fg: "#FFFFFF", accent: "#22D3EE", kind: "energy" },
  { match: /bali/i, label: "BALI ENERGY", bg: "#0F766E", fg: "#FFFFFF", accent: "#F97316", kind: "energy" },
  { match: /one energy/i, label: "ONE ENERGY", bg: "#111827", fg: "#FFFFFF", accent: "#FACC15", kind: "energy" },
  { match: /absolut/i, label: "ABSOLUT", bg: "#E0F2FE", fg: "#1E3A8A", accent: "#2563EB", kind: "spirit" },
  { match: /smirnoff/i, label: "SMIRNOFF", bg: "#B91C1C", fg: "#FFFFFF", accent: "#F8FAFC", kind: "spirit" },
  { match: /orloff/i, label: "ORLOFF", bg: "#1F2937", fg: "#FFFFFF", accent: "#94A3B8", kind: "spirit" },
  { match: /askov blueberry/i, label: "ASKOV BLUE", bg: "#1D4ED8", fg: "#FFFFFF", accent: "#93C5FD", kind: "spirit" },
  { match: /askov frutas amarelas/i, label: "ASKOV YELLOW", bg: "#FACC15", fg: "#422006", accent: "#F97316", kind: "spirit" },
  { match: /askov frutas vermelhas/i, label: "ASKOV RED", bg: "#BE123C", fg: "#FFFFFF", accent: "#F9A8D4", kind: "spirit" },
  { match: /askov/i, label: "ASKOV", bg: "#111827", fg: "#FFFFFF", accent: "#F8FAFC", kind: "spirit" },
  { match: /tanqueray/i, label: "TANQUERAY", bg: "#064E3B", fg: "#FFFFFF", accent: "#EF4444", kind: "spirit" },
  { match: /gin rocks/i, label: "ROCKS GIN", bg: "#0F766E", fg: "#FFFFFF", accent: "#A7F3D0", kind: "spirit" },
  { match: /gin eternity/i, label: "ETERNITY GIN", bg: "#1E293B", fg: "#FFFFFF", accent: "#CBD5E1", kind: "spirit" },
  { match: /london factor/i, label: "LONDON FACTOR", bg: "#1E3A8A", fg: "#FFFFFF", accent: "#F8FAFC", kind: "spirit" },
  { match: /jack daniel.*apple/i, label: "JACK APPLE", bg: "#14532D", fg: "#FFFFFF", accent: "#86EFAC", kind: "spirit" },
  { match: /jack daniel.*honey/i, label: "JACK HONEY", bg: "#92400E", fg: "#FFF7D6", accent: "#FDE047", kind: "spirit" },
  { match: /jack daniel/i, label: "JACK DANIEL'S", bg: "#111827", fg: "#FFFFFF", accent: "#F8FAFC", kind: "spirit" },
  { match: /ballantine/i, label: "BALLANTINE'S", bg: "#1E3A8A", fg: "#FFFFFF", accent: "#FDE047", kind: "spirit" },
  { match: /white horse/i, label: "WHITE HORSE", bg: "#F8FAFC", fg: "#111827", accent: "#B45309", kind: "spirit" },
  { match: /campari/i, label: "CAMPARI", bg: "#B91C1C", fg: "#FFFFFF", accent: "#111827", kind: "spirit" },
  { match: /cachaca 51|pirassununga/i, label: "51", bg: "#FDE047", fg: "#1F2937", accent: "#22C55E", kind: "spirit" },
  { match: /velho barreiro/i, label: "VELHO BARREIRO", bg: "#FACC15", fg: "#422006", accent: "#166534", kind: "spirit" },
  { match: /cantinho do vale/i, label: "CANTINHO DO VALE", bg: "#7C2D12", fg: "#FFF7D6", accent: "#F59E0B", kind: "spirit" },
  { match: /corote blueberry/i, label: "COROTE BLUE", bg: "#1D4ED8", fg: "#FFFFFF", accent: "#93C5FD", kind: "spirit" },
  { match: /corote lim/i, label: "COROTE LIMAO", bg: "#16A34A", fg: "#FFFFFF", accent: "#FDE047", kind: "spirit" },
  { match: /corote morango/i, label: "COROTE MORANGO", bg: "#BE123C", fg: "#FFFFFF", accent: "#FDA4AF", kind: "spirit" },
  { match: /corote pessego/i, label: "COROTE PESSEGO", bg: "#FB923C", fg: "#FFFFFF", accent: "#FED7AA", kind: "spirit" },
  { match: /jurupinga/i, label: "JURUPINGA", bg: "#FDE68A", fg: "#78350F", accent: "#B45309", kind: "spirit" },
  { match: /pergola/i, label: "PERGOLA", bg: "#7F1D1D", fg: "#FFF7D6", accent: "#F59E0B", kind: "wine" },
  { match: /quinta do vale/i, label: "QUINTA DO VALE", bg: "#581C87", fg: "#FFFFFF", accent: "#C084FC", kind: "wine" },
  { match: /agua de coco/i, label: "AGUA DE COCO", bg: "#F8FAFC", fg: "#0F766E", accent: "#22C55E", kind: "water" },
  { match: /agua mineral/i, label: "AGUA MINERAL", bg: "#DBEAFE", fg: "#1E3A8A", accent: "#60A5FA", kind: "water" },
  { match: /gelo saborizado/i, label: "GELO SABORIZADO", bg: "#E0F2FE", fg: "#0F172A", accent: "#38BDF8", kind: "ice" },
  { match: /gelo de coco/i, label: "GELO DE COCO", bg: "#F8FAFC", fg: "#0F766E", accent: "#94A3B8", kind: "ice" },
  { match: /pacote de gelo/i, label: "GELO", bg: "#E0F2FE", fg: "#0F172A", accent: "#38BDF8", kind: "ice" },
  { match: /mendorato|amendoim/i, label: "MENDORATO", bg: "#B45309", fg: "#FFF7D6", accent: "#FDE047", kind: "snack" },
  { match: /sensacoes|batata chips/i, label: "SENSACOES", bg: "#7E22CE", fg: "#FFFFFF", accent: "#FACC15", kind: "snack" },
  { match: /torcida/i, label: "TORCIDA", bg: "#B91C1C", fg: "#FFFFFF", accent: "#FDE047", kind: "snack" },
  { match: /bic/i, label: "BIC", bg: "#F97316", fg: "#111827", accent: "#FDE047", kind: "utility" },
  { match: /seda bem bolado/i, label: "BEM BOLADO", bg: "#111827", fg: "#FFFFFF", accent: "#22C55E", kind: "smoke" },
  { match: /souza paiol/i, label: "SOUZA PAIOL", bg: "#78350F", fg: "#FFF7D6", accent: "#F59E0B", kind: "smoke" },
  { match: /narguil|nay/i, label: "NARGUILE", bg: "#111827", fg: "#FFFFFF", accent: "#A855F7", kind: "smoke" },
  { match: /carvao/i, label: "CARVAO", bg: "#111827", fg: "#FFFFFF", accent: "#64748B", kind: "utility" },
  { match: /copo/i, label: "COPOS", bg: "#F8FAFC", fg: "#111827", accent: "#CBD5E1", kind: "utility" },
];

const badImageMarkers = [
  "images.unsplash.com",
  "photo-1618265341355",
  "d0e2d1fdf26b",
  "photo-1603481546238",
  "487240415921",
  "photo-1513558161293",
  "cdaf765ed2fd",
  "photo-1618885472999",
  "2c860c302196",
  "photo-1551024709",
  "8f23befc6f87",
];

const defaultBrand: BrandSpec = {
  match: /.*/,
  label: "THE BEST",
  bg: "#0F172A",
  fg: "#F8FAFC",
  accent: "#FACC15",
  kind: "utility",
};

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const compact = (value: string) => value.replace(/\s+/g, " ").trim();

const normalizeProductName = (value: string) =>
  compact(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const getBrandSpec = (name: string) => {
  const normalizedName = normalizeProductName(name);
  return brandSpecs.find((spec) => spec.match.test(normalizedName)) || defaultBrand;
};

const getVolume = (name: string) => {
  const match = name.match(/\b(\d+(?:[.,]\d+)?)\s*(ml|l|kg|g|un)\b/i);
  return match ? `${match[1].replace(".", ",")}${match[2].toUpperCase()}` : "";
};

const getPackageLabel = (name: string) => {
  const lower = normalizeProductName(name);
  if (lower.includes("retorn")) return "RETORNAVEL";
  if (lower.includes("long neck")) return "LONG NECK";
  if (lower.includes("garrafa") || lower.includes("litro") || lower.includes("litrao")) return "GARRAFA";
  if (lower.includes("lata")) return "LATA";
  if (lower.includes("pet")) return "PET";
  if (lower.includes("copo")) return "COPO";
  if (lower.includes("pacote") || lower.includes("maco")) return "PACOTE";
  return "PRODUTO";
};

const shapeForKind = (kind: BrandSpec["kind"], bg: string, fg: string, accent: string, label: string) => {
  const safeLabel = escapeXml(label);

  if (kind === "beer" || kind === "energy" || kind === "soda") {
    return `
      <rect x="206" y="112" width="228" height="392" rx="44" fill="${fg}" opacity=".96"/>
      <rect x="226" y="142" width="188" height="332" rx="30" fill="${bg}"/>
      <rect x="226" y="142" width="188" height="52" rx="26" fill="${accent}" opacity=".9"/>
      <rect x="226" y="420" width="188" height="54" rx="22" fill="${accent}" opacity=".9"/>
      <text x="320" y="310" text-anchor="middle" font-size="42" font-weight="900" fill="${fg}" font-family="Arial, sans-serif">${safeLabel}</text>
    `;
  }

  if (kind === "spirit" || kind === "wine") {
    return `
      <path d="M278 92h84l14 110v270c0 42-112 42-112 0V202z" fill="${fg}" opacity=".95"/>
      <path d="M288 118h64l10 90v250c0 26-84 26-84 0V208z" fill="${bg}"/>
      <rect x="246" y="244" width="148" height="138" rx="18" fill="${accent}" opacity=".96"/>
      <text x="320" y="322" text-anchor="middle" font-size="34" font-weight="900" fill="${fg}" font-family="Arial, sans-serif">${safeLabel}</text>
    `;
  }

  if (kind === "snack" || kind === "smoke" || kind === "utility") {
    return `
      <path d="M170 150h300l-28 354H198z" fill="${fg}" opacity=".96"/>
      <path d="M198 184h244l-22 286H220z" fill="${bg}"/>
      <path d="M206 206h228l-8 76H214z" fill="${accent}" opacity=".9"/>
      <text x="320" y="336" text-anchor="middle" font-size="38" font-weight="900" fill="${fg}" font-family="Arial, sans-serif">${safeLabel}</text>
    `;
  }

  return `
    <circle cx="320" cy="302" r="164" fill="${fg}" opacity=".96"/>
    <circle cx="320" cy="302" r="128" fill="${bg}"/>
    <text x="320" y="316" text-anchor="middle" font-size="38" font-weight="900" fill="${fg}" font-family="Arial, sans-serif">${safeLabel}</text>
  `;
};

export const isGeneratedProductImage = (url?: string | null) =>
  !!url && url.startsWith("data:image/svg+xml");

export const isUsableStoredProductImage = (url?: string | null) => {
  if (!url || typeof url !== "string") return false;
  const normalized = url.trim().toLowerCase();
  if (!normalized || normalized === "null" || normalized === "undefined") return false;
  if (isGeneratedProductImage(normalized)) return true;
  return !badImageMarkers.some((marker) => normalized.includes(marker));
};

export const buildProductArtDataUrl = (item: ProductImageItem) => {
  const cleanName = compact(item.name || "Produto");
  const spec = getBrandSpec(cleanName);
  const volume = getVolume(cleanName);
  const packageLabel = getPackageLabel(cleanName);
  const title = escapeXml(cleanName.toUpperCase());
  const brand = escapeXml(spec.label);
  const meta = escapeXml(compact([packageLabel, volume].filter(Boolean).join(" - ")));
  const shape = shapeForKind(spec.kind, spec.bg, spec.fg, spec.accent, spec.label);

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
  <defs>
    <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="${spec.bg}"/>
      <stop offset="100%" stop-color="#050505"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="22" stdDeviation="20" flood-color="#000" flood-opacity=".35"/>
    </filter>
  </defs>
  <rect width="640" height="640" rx="64" fill="url(#bg)"/>
  <circle cx="96" cy="92" r="112" fill="${spec.accent}" opacity=".18"/>
  <circle cx="566" cy="526" r="150" fill="${spec.accent}" opacity=".16"/>
  <g filter="url(#shadow)">${shape}</g>
  <text x="320" y="76" text-anchor="middle" font-size="28" font-weight="800" fill="${spec.fg}" opacity=".82" font-family="Arial, sans-serif">${brand}</text>
  <text x="320" y="552" text-anchor="middle" font-size="26" font-weight="900" fill="${spec.fg}" font-family="Arial, sans-serif">${meta}</text>
  <text x="320" y="590" text-anchor="middle" font-size="18" font-weight="700" fill="${spec.fg}" opacity=".72" font-family="Arial, sans-serif">${title}</text>
</svg>`;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

export const getProductDisplayImage = (item: ProductImageItem) => {
  if (isUsableStoredProductImage(item.image_url)) {
    return item.image_url!.trim();
  }

  return buildProductArtDataUrl(item);
};
