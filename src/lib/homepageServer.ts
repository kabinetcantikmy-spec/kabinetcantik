import { supabaseReady, createServiceClient } from "@/lib/supabase";
import { createSupabaseServer } from "@/lib/supabaseServer";
import { HomepageConfig, DEFAULT_HOMEPAGE } from "@/lib/homepage";

const ENV_WA = process.env.NEXT_PUBLIC_WHATSAPP_SALES || "";

/**
 * Muat config homepage dari `settings` (key 'homepage').
 * - Laman awam: hantar orgId (service-role, skop org) + isDefault.
 * - Admin: tiada orgId → RLS client, skop org staf automatik.
 * Fallback: teks default. WhatsApp — hanya tenant KC default guna nombor env;
 * tenant lain kosong (elak bocor nombor KC).
 */
export async function loadHomepageConfig(orgId?: string | null, isDefault = false): Promise<HomepageConfig> {
  const base: HomepageConfig = { ...DEFAULT_HOMEPAGE, whatsapp: isDefault ? ENV_WA : "" };
  if (!supabaseReady()) return base;
  try {
    const sb = orgId ? createServiceClient() : createSupabaseServer();
    let q = sb.from("settings").select("value").eq("key", "homepage");
    if (orgId) q = q.eq("org_id", orgId);
    const { data } = await q.limit(1).maybeSingle();
    const cfg = data?.value as Partial<HomepageConfig> | undefined;
    if (cfg && typeof cfg === "object") {
      return {
        heroEyebrow: cfg.heroEyebrow || base.heroEyebrow,
        heroTitle: cfg.heroTitle || base.heroTitle,
        heroTagline: cfg.heroTagline || base.heroTagline,
        heroImage: cfg.heroImage || base.heroImage,
        beforeImage: cfg.beforeImage || base.beforeImage,
        afterImage: cfg.afterImage || base.afterImage,
        stats: Array.isArray(cfg.stats) && cfg.stats.length ? cfg.stats.slice(0, 3) : base.stats,
        whatsapp: typeof cfg.whatsapp === "string" ? cfg.whatsapp : base.whatsapp,
        serviceArea: cfg.serviceArea || base.serviceArea,
        showroomAddress: typeof cfg.showroomAddress === "string" ? cfg.showroomAddress : base.showroomAddress,
      };
    }
  } catch {
    /* fallback */
  }
  return base;
}
