import { createServiceClient, supabaseReady } from "@/lib/supabase";
import { PRICING, PricingConfig } from "@/lib/pricing";

/**
 * Muatkan pricing config dari Supabase `settings` (key 'pricing').
 * Fallback ke PRICING statik jika DB tiada / kosong. Guna di server sahaja.
 */
export async function loadPricingConfig(): Promise<PricingConfig> {
  if (!supabaseReady()) return PRICING;
  try {
    const sb = createServiceClient();
    const { data } = await sb.from("settings").select("value").eq("key", "pricing").single();
    const cfg = data?.value as Partial<PricingConfig> | undefined;
    if (cfg && Array.isArray(cfg.categories) && cfg.categories.length) {
      return {
        categories: cfg.categories,
        publicRangePct: cfg.publicRangePct ?? PRICING.publicRangePct,
        depositSplit: cfg.depositSplit ?? PRICING.depositSplit,
        sstEnabled: cfg.sstEnabled ?? PRICING.sstEnabled,
        sstRate: cfg.sstRate ?? PRICING.sstRate,
      };
    }
  } catch {
    /* fallback */
  }
  return PRICING;
}
