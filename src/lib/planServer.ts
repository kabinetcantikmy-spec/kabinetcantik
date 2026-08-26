import { createServiceClient, supabaseReady } from "@/lib/supabase";
import { PLAN_FEATURES, PlanFeatures, Plan, effectivePlan } from "@/lib/plan";

/** Resolve plan berkesan + ciri untuk satu org (server sahaja). Fallback: freemium. */
export async function planForOrg(orgId?: string | null): Promise<{ plan: Plan; features: PlanFeatures }> {
  const fallback = { plan: "freemium" as Plan, features: PLAN_FEATURES.freemium };
  if (!orgId || !supabaseReady()) return fallback;
  try {
    const sb = createServiceClient();
    const { data } = await sb.from("tenants").select("plan, status, trial_ends_at").eq("id", orgId).maybeSingle();
    if (!data) return fallback;
    const p = effectivePlan(data as { plan?: string; status?: string; trial_ends_at?: string | null });
    return { plan: p, features: PLAN_FEATURES[p] };
  } catch {
    return fallback;
  }
}
