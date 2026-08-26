// KYB + setup journey untuk tenant baru.
export interface BusinessInfo {
  namaSah: string;      // nama perniagaan berdaftar
  jenisEntiti: string;  // Sdn Bhd | Enterprise | Milikan Tunggal | Perkongsian
  noSsm: string;
  telefon: string;
  emel: string;
  alamat: string;
  pemilik: string;      // nama pemilik / wakil
}
export const EMPTY_BUSINESS: BusinessInfo = {
  namaSah: "", jenisEntiti: "", noSsm: "", telefon: "", emel: "", alamat: "", pemilik: "",
};

export interface OnboardingState {
  done: boolean;
  steps: Record<string, boolean>;
}
export const EMPTY_ONBOARDING: OnboardingState = { done: false, steps: {} };

export const SETUP_STEPS = [
  { key: "perniagaan", label: "Perniagaan Anda", desc: "Maklumat syarikat (KYB)" },
  { key: "jenama", label: "Jenama", desc: "Logo & nama syarikat" },
  { key: "laman", label: "Laman Awam", desc: "Hero, WhatsApp & kawasan" },
  { key: "harga", label: "Harga & Bahan", desc: "Katalog & kadar harga" },
  { key: "portfolio", label: "Portfolio", desc: "Projek pertama anda" },
] as const;

export const ENTITI_OPTIONS = ["Sdn Bhd", "Enterprise", "Milikan Tunggal", "Perkongsian", "Lain-lain"];
