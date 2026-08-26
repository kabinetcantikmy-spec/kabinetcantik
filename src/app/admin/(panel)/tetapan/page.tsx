import { createSupabaseServer, requireRole } from "@/lib/supabaseServer";
import { supabaseReady } from "@/lib/supabase";
import { loadPricingConfig } from "@/lib/pricingServer";
import SettingsEditor, { StaffUser } from "@/components/admin/SettingsEditor";

export const dynamic = "force-dynamic";

export default async function TetapanPage() {
  await requireRole(["admin"]);
  const config = await loadPricingConfig();
  let users: StaffUser[] = [];
  let waEnabled = false;
  if (supabaseReady()) {
    const sb = createSupabaseServer();
    const { data } = await sb.from("profiles").select("id, nama, emel, role").order("role");
    users = (data || []) as StaffUser[];
    const { data: waRow } = await sb.from("settings").select("value").eq("key", "wa_automation_enabled").single();
    waEnabled = waRow?.value === true;
  }

  return (
    <div>
      <h1 className="h-display text-2xl">Tetapan</h1>
      <p className="mt-1 text-sm text-ink/50">Kadar harga, cukai, deposit & pengurusan pengguna (admin sahaja).</p>
      <div className="mt-6">
        <SettingsEditor config={config} users={users} waEnabled={waEnabled} />
      </div>
    </div>
  );
}
