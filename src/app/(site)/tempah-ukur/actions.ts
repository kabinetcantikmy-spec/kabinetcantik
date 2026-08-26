"use server";
import { createServiceClient, supabaseReady } from "@/lib/supabase";
import { sendEmail, emailShell } from "@/lib/email";
import { resolveOrgId } from "@/lib/tenant";
import { tenantBrand } from "@/lib/branding";
import { headers } from "next/headers";

type Res = { ok: boolean; error?: string };

export async function bookSiteVisit(input: {
  nama: string;
  telefon: string;
  emel?: string;
  tarikh: string;
  masa?: string;
  alamat?: string;
}): Promise<Res> {
  if (!supabaseReady()) return { ok: false, error: "Sistem tidak tersedia." };
  if (!input.nama.trim() || !input.telefon.trim() || !input.tarikh) {
    return { ok: false, error: "Nama, telefon & tarikh wajib." };
  }
  const sb = createServiceClient();
  const orgId = await resolveOrgId((await headers()).get("host"));
  const brand = await tenantBrand(orgId);

  const { data: lead } = await sb
    .from("leads")
    .insert({
      org_id: orgId,
      nama: input.nama.trim(),
      telefon: input.telefon.trim(),
      emel: input.emel?.trim() || null,
      source: "tempah_ukur",
      stage: "Ukur Tapak",
    })
    .select("id")
    .single();

  await sb.from("appointments").insert({
    org_id: orgId,
    lead_id: lead?.id || null,
    jenis: "site_visit",
    tarikh: input.tarikh,
    masa: input.masa || null,
    status: "scheduled",
    catatan: input.alamat || null,
  });

  if (input.emel) {
    await sendEmail({
      to: input.emel,
      fromName: brand.nama,
      subject: `Permohonan ukur tapak diterima — ${brand.nama}`,
      html: emailShell(
        "Terima kasih!",
        `Hai ${input.nama}, kami menerima permohonan ukur tapak anda untuk <b>${input.tarikh}${input.masa ? " " + input.masa : ""}</b>. Team kami akan sahkan tidak lama lagi.`,
        brand.nama
      ),
    });
  }

  return { ok: true };
}
