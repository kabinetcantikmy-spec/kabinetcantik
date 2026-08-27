// Definisi pakej (tier) & ciri. Sumber kebenaran untuk feature-gating.
// "launch" = fasa percuma sekarang: ciri penuh, badge KEKAL, tiada white-label,
// 3 lead/bulan, TANPA tamat (tiada trial countdown). Tier lain kekal dorman.
export type Plan = "freemium" | "hero" | "pro" | "launch";

export interface PlanFeatures {
  staffLimit: number; // Infinity untuk pro
  leadQuota: number; // lead marketplace / bulan (had lembut). Fasa percuma: 3.
  sendBrandedQuote: boolean; // hantar quote via sistem + terima online + portal
  customerPortal: boolean;
  waAutomation: boolean;
  catalogUpload: boolean;
  blogReviews: boolean; // urus & terbit ULASAN pelanggan
  blog: boolean; // modul Blog (artikel) — diasingkan dari ulasan; launch sorok dulu
  removeBadge: boolean; // white-label — buang "Powered by KabinetCantik"
  customDomain: boolean;
  suppliers: boolean; // portal pembekal/installer
  quoteWatermark: boolean; // watermark pada quote (freemium)
}

export const PLAN_FEATURES: Record<Plan, PlanFeatures> = {
  freemium: {
    staffLimit: 1,
    leadQuota: 3,
    sendBrandedQuote: false,
    customerPortal: false,
    waAutomation: false,
    catalogUpload: false,
    blogReviews: false,
    blog: false,
    removeBadge: false,
    customDomain: false,
    suppliers: false,
    quoteWatermark: true,
  },
  hero: {
    staffLimit: 5,
    leadQuota: 10,
    sendBrandedQuote: true,
    customerPortal: true,
    waAutomation: true,
    catalogUpload: true,
    blogReviews: true,
    blog: true,
    removeBadge: true,
    customDomain: false,
    suppliers: false,
    quoteWatermark: false,
  },
  pro: {
    staffLimit: Infinity,
    leadQuota: 25,
    sendBrandedQuote: true,
    customerPortal: true,
    waAutomation: true,
    catalogUpload: true,
    blogReviews: true,
    blog: true,
    removeBadge: true,
    customDomain: true,
    suppliers: true,
    quoteWatermark: false,
  },
  // FASA PERCUMA — ciri penuh tapi badge KEKAL & tiada white-label. Tiada tamat.
  launch: {
    staffLimit: Infinity,
    leadQuota: 3,
    sendBrandedQuote: true,
    customerPortal: true,
    waAutomation: true,
    catalogUpload: true,
    blogReviews: true, // Ulasan terbuka
    blog: false,       // Blog tersorok dulu
    removeBadge: false, // badge kekal
    customDomain: false,
    suppliers: true,
    quoteWatermark: false,
  },
};

export const PLAN_LABEL: Record<Plan, string> = { freemium: "Freemium", hero: "Hero", pro: "Pro", launch: "Percuma" };
export const PLAN_PRICE: Record<Plan, number> = { freemium: 0, hero: 249, pro: 499, launch: 0 };

function isPlan(v: unknown): v is Plan {
  return v === "freemium" || v === "hero" || v === "pro" || v === "launch";
}

/** Plan berkesan: trial aktif → Pro penuh; trial luput → Freemium floor; else plan sebenar. */
export function effectivePlan(t: { plan?: string | null; status?: string | null; trial_ends_at?: string | null }): Plan {
  if ((t.status || "") === "trial") {
    const ends = t.trial_ends_at ? new Date(t.trial_ends_at).getTime() : 0;
    return ends > Date.now() ? "pro" : "freemium";
  }
  return isPlan(t.plan) ? t.plan : "freemium";
}
