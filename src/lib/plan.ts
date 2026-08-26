// Definisi pakej (tier) & ciri. Sumber kebenaran untuk feature-gating.
export type Plan = "freemium" | "hero" | "pro";

export interface PlanFeatures {
  staffLimit: number; // Infinity untuk pro
  sendBrandedQuote: boolean; // hantar quote via sistem + terima online + portal
  customerPortal: boolean;
  waAutomation: boolean;
  catalogUpload: boolean;
  blogReviews: boolean;
  removeBadge: boolean; // white-label — buang "Powered by KabinetCantik"
  customDomain: boolean;
  suppliers: boolean; // portal pembekal/installer — Pro
  quoteWatermark: boolean; // watermark pada quote (freemium)
}

export const PLAN_FEATURES: Record<Plan, PlanFeatures> = {
  freemium: {
    staffLimit: 1,
    sendBrandedQuote: false,
    customerPortal: false,
    waAutomation: false,
    catalogUpload: false,
    blogReviews: false,
    removeBadge: false,
    customDomain: false,
    suppliers: false,
    quoteWatermark: true,
  },
  hero: {
    staffLimit: 5,
    sendBrandedQuote: true,
    customerPortal: true,
    waAutomation: true,
    catalogUpload: true,
    blogReviews: true,
    removeBadge: true,
    customDomain: false,
    suppliers: false,
    quoteWatermark: false,
  },
  pro: {
    staffLimit: Infinity,
    sendBrandedQuote: true,
    customerPortal: true,
    waAutomation: true,
    catalogUpload: true,
    blogReviews: true,
    removeBadge: true,
    customDomain: true,
    suppliers: true,
    quoteWatermark: false,
  },
};

export const PLAN_LABEL: Record<Plan, string> = { freemium: "Freemium", hero: "Hero", pro: "Pro" };
export const PLAN_PRICE: Record<Plan, number> = { freemium: 0, hero: 249, pro: 499 };

function isPlan(v: unknown): v is Plan {
  return v === "freemium" || v === "hero" || v === "pro";
}

/** Plan berkesan: trial aktif → Pro penuh; trial luput → Freemium floor; else plan sebenar. */
export function effectivePlan(t: { plan?: string | null; status?: string | null; trial_ends_at?: string | null }): Plan {
  if ((t.status || "") === "trial") {
    const ends = t.trial_ends_at ? new Date(t.trial_ends_at).getTime() : 0;
    return ends > Date.now() ? "pro" : "freemium";
  }
  return isPlan(t.plan) ? t.plan : "freemium";
}
