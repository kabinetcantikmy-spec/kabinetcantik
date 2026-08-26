import { createServiceClient, supabaseReady } from "@/lib/supabase";
import { resolveTenant } from "@/lib/tenant";

export interface Brand {
  nama: string;
  logoUrl: string;
  accent: string;
}

export const DEFAULT_BRAND: Brand = {
  nama: "KabinetCantik",
  logoUrl: "/logo-mark.png",
  accent: "#AE873B",
};

/** Ambil jenama tenant (nama, logo, warna) dari org_id. Fallback ke KC default. */
export async function tenantBrand(orgId: string | null | undefined): Promise<Brand> {
  if (!orgId || !supabaseReady()) return DEFAULT_BRAND;
  try {
    const sb = createServiceClient();
    const { data } = await sb.from("tenants").select("nama, branding").eq("id", orgId).maybeSingle();
    if (!data) return DEFAULT_BRAND;
    const b = (data.branding as Record<string, unknown>) || {};
    return {
      nama: (data.nama as string) || DEFAULT_BRAND.nama,
      logoUrl: (b.logo_url as string) || DEFAULT_BRAND.logoUrl,
      accent: (b.warna as string) || DEFAULT_BRAND.accent,
    };
  } catch {
    return DEFAULT_BRAND;
  }
}

/** Jenama tenant ikut host (untuk laman awam). Fallback ke KC default. */
export async function hostBrand(host: string | null | undefined): Promise<Brand> {
  try {
    const t = await resolveTenant(host);
    if (!t) return DEFAULT_BRAND;
    const b = t.branding || {};
    return {
      nama: t.nama || DEFAULT_BRAND.nama,
      logoUrl: (b.logo_url as string) || DEFAULT_BRAND.logoUrl,
      accent: (b.warna as string) || DEFAULT_BRAND.accent,
    };
  } catch {
    return DEFAULT_BRAND;
  }
}
