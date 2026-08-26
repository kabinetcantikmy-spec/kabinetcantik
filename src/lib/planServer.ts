import { createServiceClient, supabaseReady } from "@/lib/supabase";
import { PLAN_FEATURES, PlanFeatures, Plan, effectivePlan } from "@/lib/plan";

export interface PlanInfo {
  plan: Plan; // plan berkesan (trial → pro)
  features: PlanFeatures;
  status: string; // trial | active | suspended | cancelled
  trialDaysLeft: number | null; // baki hari trial (null jika bukan trial)
  rawPlan: string; // nilai plan dalam DB
}

/** Resolve plan berkesan + ciri untuk satu org (server sahaja). Fallback: freemium. */
export async function planForOrg(orgId?: string | null): Promise<PlanInfo> {
  const fallback: PlanInfo = { plan: "freemium", features: PLAN_FEATURES.freemium, status: "", trialDaysLeft: null, rawPlan: "freemium" };
  if (!orgId || !supabaseReady()) return fallback;
  try {
    const sb = createServiceClient();
    const { data } = await sb.from("tenants").select("plan, status, trial_ends_at").eq("id", orgId).maybeSingle();
    if (!data) return fallback;
    const d = data as { plan?: string; status?: string; trial_ends_at?: string | null };
    const status = d.status || "";
    const ends = d.trial_ends_at ? new Date(d.trial_ends_at).getTime() : 0;
    const trialDaysLeft = status === "trial" && ends ? Math.ceil((ends - Date.now()) / 86400000) : null;
    const p = effectivePlan(d);
    return { plan: p, features: PLAN_FEATURES[p], status, trialDaysLeft, rawPlan: d.plan || "freemium" };
  } catch {
    return fallback;
  }
}
