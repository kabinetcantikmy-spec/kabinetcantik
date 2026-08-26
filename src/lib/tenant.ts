import { headers } from "next/headers";
import { createServiceClient, supabaseReady } from "@/lib/supabase";

const ROOT = "kabinetcantik.com";
// Subdomain khas yang BUKAN tenant → jatuh ke tenant KC default.
const RESERVED = new Set(["", "www", "app", "admin", "demo", "kabinetcantik"]);
const DEFAULT_SLUG = "kabinetcantik"; // tenant KC (bare domain + demo)

/** Cabut subdomain dari host. `melecun.kabinetcantik.com` → "melecun". Bare/lain → null. */
export function subdomainFromHost(host: string | null | undefined): string | null {
  if (!host) return null;
  const h = host.split(":")[0].toLowerCase().trim();
  if (h === ROOT) return null;
  if (h.endsWith(`.${ROOT}`)) {
    const sub = h.slice(0, h.length - ROOT.length - 1);
    return sub.includes(".") ? sub.split(".")[0] : sub;
  }
  return null; // custom domain / localhost — sokongan kemudian
}

export interface TenantCtx {
  orgId: string;
  nama: string;
  slug: string;
  branding: Record<string, unknown>;
  config: Record<string, unknown>;
}

/**
 * Resolve tenant dari host permintaan.
 * bare / demo / reserved → tenant KC default. null jika slug tak wujud.
 */
export async function resolveTenant(host: string | null | undefined): Promise<TenantCtx | null> {
  if (!supabaseReady()) return null;
  const sub = subdomainFromHost(host);
  const slug = sub && !RESERVED.has(sub) ? sub : DEFAULT_SLUG;
  const sb = createServiceClient();
  const { data } = await sb
    .from("tenants")
    .select("id, nama, slug, branding, config")
    .eq("slug", slug)
    .maybeSingle();
  if (!data) return null;
  return {
    orgId: data.id as string,
    nama: (data.nama as string) || "",
    slug: data.slug as string,
    branding: (data.branding as Record<string, unknown>) || {},
    config: (data.config as Record<string, unknown>) || {},
  };
}

/** Hanya org_id (untuk cop lead / skop harga). */
export async function resolveOrgId(host: string | null | undefined): Promise<string | null> {
  const t = await resolveTenant(host);
  return t?.orgId ?? null;
}

/**
 * Untuk laman awam (server component / action): resolve org dari host permintaan.
 * `isDefault` = tenant KC bare-domain/reserved → benarkan kandungan demo statik.
 * Tenant subdomain sebenar → isDefault false (hanya papar baris DB org sendiri).
 */
export async function currentOrg(): Promise<{ orgId: string | null; isDefault: boolean }> {
  const host = (await headers()).get("host");
  const sub = subdomainFromHost(host);
  const isDefault = !sub || RESERVED.has(sub);
  const orgId = await resolveOrgId(host);
  return { orgId, isDefault };
}
