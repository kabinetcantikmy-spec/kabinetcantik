// Peringkat pipeline CRM (spec §6.1).
export const STAGES = [
  "Baru",
  "Dihubungi",
  "Ukur Tapak",
  "Sebut Harga",
  "Deposit",
  "Fabrikasi",
  "Pemasangan",
  "Siap",
] as const;

export type Stage = (typeof STAGES)[number];

export const LOST = "Batal/Lost";

export interface Lead {
  id: string;
  nama: string;
  telefon: string;
  emel: string | null;
  source: string | null;
  kategori: string[] | null;
  jawapan_wizard: Record<string, unknown> | null;
  budget_min: number | null;
  budget_max: number | null;
  timeline: string | null;
  stage: string;
  assignee_id: string | null;
  next_followup: string | null;
  lost_reason: string | null;
  created_at: string;
}

export interface LeadActivity {
  id: string;
  lead_id: string;
  oleh: string | null;
  jenis: string;
  mesej: string | null;
  created_at: string;
}

export interface Quotation {
  id: string;
  lead_id: string | null;
  no_quote: string;
  versi: number;
  status: "draft" | "sent" | "accepted" | "rejected";
  subtotal: number;
  diskaun: number;
  cukai: number;
  jumlah: number;
  deposit_pct: number;
  nota: string | null;
  created_at: string;
}

export interface QuotationItem {
  id: string;
  quotation_id: string;
  kategori: string | null;
  keterangan: string;
  material_tier: string | null;
  kuantiti: number;
  unit: string | null;
  harga_unit: number;
  jumlah: number;
  urutan: number | null;
}

// Warna aksen ringkas bagi setiap peringkat (untuk lajur Kanban).
export const STAGE_ACCENT: Record<string, string> = {
  Baru: "#AE873B",
  Dihubungi: "#7D6845",
  "Ukur Tapak": "#4b6b8a",
  "Sebut Harga": "#6a5acd",
  Deposit: "#2e8b57",
  Fabrikasi: "#c98a2b",
  Pemasangan: "#3a7ca5",
  Siap: "#2e7d32",
  "Batal/Lost": "#9aa0a6",
};
