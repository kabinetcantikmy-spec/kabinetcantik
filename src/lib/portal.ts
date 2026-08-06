export const PROJECT_STAGES = ["Deposit", "Fabrikasi", "Pemasangan", "Siap", "Warranti"] as const;
export type ProjectStage = (typeof PROJECT_STAGES)[number];

export interface Project {
  id: string;
  tajuk: string;
  kategori: string | null;
  status: string;
  nilai_kontrak: number;
  deposit_pct: number;
  tarikh_mula: string | null;
  tarikh_pasang: string | null;
  warranty_until: string | null;
  created_at: string;
}

export interface Payment {
  id: string;
  project_id: string;
  jenis: "deposit" | "progress" | "final";
  jumlah: number;
  status: "pending" | "paid" | "failed";
  dibayar_pada: string | null;
}

export interface Design {
  id: string;
  project_id: string;
  tajuk: string | null;
  image_url: string;
  status: "pending" | "approved" | "revision";
  komen: string | null;
}

export interface WarrantyClaim {
  id: string;
  project_id: string;
  keterangan: string;
  url_gambar: string | null;
  status: string;
  tindakan: string | null;
  created_at: string;
}
