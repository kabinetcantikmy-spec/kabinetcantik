"use server";
import { supabaseReady } from "@/lib/supabase";
import { createSupabaseServer, requireStaff } from "@/lib/supabaseServer";
import { sendEmail, emailShell } from "@/lib/email";
import { waAppointment } from "@/lib/whatsapp";
import { revalidatePath } from "next/cache";

type Res = { ok: boolean; error?: string };

export async function createAppointment(input: {
  lead_id?: string;
  jenis: string;
  tarikh: string;
  masa?: string;
  catatan?: string;
}): Promise<Res> {
  const staff = await requireStaff();
  if (!supabaseReady()) return { ok: false, error: "Supabase belum dikonfigurasi." };
  if (!input.tarikh) return { ok: false, error: "Tarikh wajib." };
  const sb = createSupabaseServer();
  const { error } = await sb.from("appointments").insert({
    lead_id: input.lead_id || null,
    jenis: input.jenis,
    tarikh: input.tarikh,
    masa: input.masa || null,
    catatan: input.catatan || null,
    status: "scheduled",
  });
  if (error) return { ok: false, error: error.message };
  const jenisLabel = input.jenis === "install" ? "pemasangan" : "ukur tapak";
  if (input.lead_id) {
    await sb.from("lead_activity").insert({
      lead_id: input.lead_id,
      oleh: staff.nama,
      jenis: "note",
      mesej: `Temujanji ${jenisLabel} pada ${input.tarikh}${input.masa ? " " + input.masa : ""}`,
    });
    // Emel + WhatsApp pengesahan ke pelanggan
    const { data: lead } = await sb.from("leads").select("nama, emel, telefon").eq("id", input.lead_id).single();
    if (lead?.emel) {
      await sendEmail({
        to: lead.emel,
        subject: `Pengesahan temujanji ${jenisLabel} — KabinetCantik`,
        html: emailShell(
          "Temujanji disahkan",
          `Hai ${lead.nama || ""}, temujanji <b>${jenisLabel}</b> anda ditetapkan pada <b>${input.tarikh}${input.masa ? " " + input.masa : ""}</b>.${input.catatan ? `<br>Catatan: ${input.catatan}` : ""}<br><br>Jumpa nanti!`
        ),
      });
    }
    if (lead?.telefon) await waAppointment(lead.telefon, lead.nama || "", `${input.tarikh}${input.masa ? " " + input.masa : ""}`, input.lead_id);
  }
  revalidatePath("/admin/kalendar");
  return { ok: true };
}

export async function updateAppointmentStatus(id: string, status: string): Promise<Res> {
  await requireStaff();
  if (!supabaseReady()) return { ok: false, error: "Supabase belum dikonfigurasi." };
  const sb = createSupabaseServer();
  const { error } = await sb.from("appointments").update({ status }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/kalendar");
  return { ok: true };
}
