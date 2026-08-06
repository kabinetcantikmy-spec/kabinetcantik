// Instant-estimate pricing config.
// Placeholder pasaran 2026 — GANTI dengan kadar sebenar KabinetCantik.
// Dalam produksi, getPricingConfig() patut baca dari Supabase `materials` + `settings`.
// Config ini serasi dengan JSON yang dieksport dari Panel Harga Admin.

export type Tier = "economy" | "standard" | "premium";

export interface CategoryRate {
  key: string;
  name: string;
  unit: string; // "kaki lari" | "kaki persegi"
  economy: number;
  standard: number;
  premium: number;
}

export interface PricingConfig {
  categories: CategoryRate[];
  publicRangePct: number; // estimate dipapar ±peratus ini
  depositSplit: [number, number, number];
  sstEnabled: boolean;
  sstRate: number;
}

export const PRICING: PricingConfig = {
  categories: [
    { key: "dapur_bawah", name: "Kabinet Dapur (bawah)", unit: "kaki lari", economy: 240, standard: 375, premium: 620 },
    { key: "dapur_atas", name: "Kabinet Dapur (atas)", unit: "kaki lari", economy: 200, standard: 320, premium: 520 },
    { key: "wardrobe", name: "Wardrobe", unit: "kaki lari", economy: 220, standard: 350, premium: 580 },
    { key: "tv", name: "TV Cabinet", unit: "kaki lari", economy: 200, standard: 320, premium: 520 },
    { key: "panel", name: "Wall Panelling", unit: "kaki persegi", economy: 60, standard: 110, premium: 180 },
  ],
  publicRangePct: 20,
  depositSplit: [50, 40, 10],
  sstEnabled: false,
  sstRate: 6,
};

/** Titik masuk tunggal — nanti tukar untuk baca dari Supabase. */
export function getPricingConfig(): PricingConfig {
  return PRICING;
}

export interface EstimateInput {
  categoryKey: string;
  tier: Tier;
  quantity: number; // kaki lari / kaki persegi
}

export interface EstimateResult {
  low: number;
  high: number;
  depositLow: number;
  depositHigh: number;
  unit: string;
}

/** Kira julat anggaran (±publicRangePct) + julat deposit pertama. */
export function estimate(input: EstimateInput, cfg: PricingConfig = PRICING): EstimateResult | null {
  const cat = cfg.categories.find((c) => c.key === input.categoryKey);
  if (!cat || input.quantity <= 0) return null;
  const rate = cat[input.tier];
  let base = rate * input.quantity;
  if (cfg.sstEnabled) base = base * (1 + cfg.sstRate / 100);
  const rp = cfg.publicRangePct / 100;
  const low = base * (1 - rp);
  const high = base * (1 + rp);
  const dep = cfg.depositSplit[0] / 100;
  return {
    low,
    high,
    depositLow: low * dep,
    depositHigh: high * dep,
    unit: cat.unit,
  };
}

export function formatRM(n: number): string {
  return "RM" + Math.round(n).toLocaleString("en-MY");
}
