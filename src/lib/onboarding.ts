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
  { key: "jenama", label: "Jenama", desc: "Nama brand & logo anda" },
  { key: "perniagaan", label: "Perniagaan Anda", desc: "Maklumat syarikat" },
];

export const ENTITI_OPTIONS = ["Sdn Bhd", "Enterprise", "Milikan Tunggal", "Perkongsian", "Lain-lain"];
