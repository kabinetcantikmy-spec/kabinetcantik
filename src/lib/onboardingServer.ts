import { supabaseReady } from "@/lib/supabase";
import { createSupabaseServer } from "@/lib/supabaseServer";
import { BusinessInfo, EMPTY_BUSINESS, OnboardingState, EMPTY_ONBOARDING } from "@/lib/onboarding";

export async function loadBusiness(): Promise<BusinessInfo> {
  if (!supabaseReady()) return EMPTY_BUSINESS;
  try {
    const sb = createSupabaseServer();
    const { data } = await sb.from("settings").select("value").eq("key", "business").limit(1).maybeSingle();
    const v = data?.value as Partial<BusinessInfo> | undefined;
    return v && typeof v === "object" ? { ...EMPTY_BUSINESS, ...v } : EMPTY_BUSINESS;
  } catch {
    return EMPTY_BUSINESS;
  }
}

export async function loadOnboarding(): Promise<OnboardingState> {
  if (!supabaseReady()) return EMPTY_ONBOARDING;
  try {
    const sb = createSupabaseServer();
    const { data } = await sb.from("settings").select("value").eq("key", "onboarding").limit(1).maybeSingle();
    const v = data?.value as Partial<OnboardingState> | undefined;
    return v && typeof v === "object"
      ? { done: Boolean(v.done), steps: (v.steps as Record<string, boolean>) || {} }
      : EMPTY_ONBOARDING;
  } catch {
    return EMPTY_ONBOARDING;
  }
}
