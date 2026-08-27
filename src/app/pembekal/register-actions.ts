"use server";
import { createServiceClient, supabaseReady } from "@/lib/supabase";
import { sendEmail, emailShell } from "@/lib/email";
import { resolveOrgId } from "@/lib/tenant";
import { tenantBrand } from "@/lib/branding";
import { planForOrg } from "@/lib/planServer";
import { headers } from "next/headers";

type Res = { ok: boolean; error?: string };

export async function registerSupplier(input: {
  nama: string;
  emel: string;
  jenis?: string;
  password: string;
}): Promise<Res> {
  if (!supabaseReady()) return { ok: false, error: "Sistem tidak tersedia." };
  if (!input.nama.trim() || !input.emel.trim() || !input.password) {
    return { ok: false, error: "Nama, emel & kata laluan wajib." };
  }
  if (input.password.length < 6) return { ok: false, error: "Kata laluan minimum 6 aksara." };

  const sb = createServiceClient();
  const orgId = await resolveOrgId((await headers()).get("host"));
  const brand = await tenantBrand(orgId);
  const { features } = await planForOrg(orgId);
  if (!features.suppliers) return { ok: false, error: "Pendaftaran pembekal tidak tersedia untuk laman ini." };

  // 1) Cipta akaun auth (ringkas — profil KYB dilengkapkan selepas login)
  const { data: created, error: authErr } = await sb.auth.admin.createUser({
    email: input.emel.trim(),
    password: input.password,
    email_confirm: true,
  });
  if (authErr || !created?.user) {
    const m = (authErr?.message || "").toLowerCase();
    const dup = m.includes("already") || m.includes("registered") || m.includes("checking email") || m.includes("duplicate") || m.includes("exists");
    return { ok: false, error: dup ? "Emel ini sudah mempunyai akaun. Guna emel lain, atau log masuk." : (authErr?.message || "Gagal cipta akaun. Cuba lagi.") };
  }

  // 2) Cipta rekod supplier (pending, profil belum lengkap)
  const { data: sup, error: supErr } = await sb
    .from("suppliers")
    .insert({
      org_id: orgId,
      nama: input.nama.trim(),
      emel: input.emel.trim(),
      jenis: input.jenis === "installer" ? "installer" : "pembekal",
      status: "pending",
      profil_lengkap: false,
    })
    .select("id")
    .single();
  if (supErr || !sup) return { ok: false, error: supErr?.message || "Gagal cipta rekod." };

  // 3) Pautkan profil
  await sb.from("profiles").upsert({
    id: created.user.id,
    nama: input.nama.trim(),
    emel: input.emel.trim(),
    role: "supplier",
    supplier_id: sup.id,
    org_id: orgId,
  });

  // 4) Emel pengesahan
  await sendEmail({
    to: input.emel.trim(),
    fromName: brand.nama,
    subject: `Pendaftaran pembekal diterima — ${brand.nama}`,
    html: emailShell("Terima kasih mendaftar", `Akaun anda dah dicipta. Langkah seterusnya: <b>log masuk & lengkapkan profil KYB</b> (butiran syarikat + dokumen) supaya kami boleh sahkan & luluskan akaun anda. Log masuk di <b>/pembekal/login</b>.`, brand.nama),
  });

  return { ok: true };
}
