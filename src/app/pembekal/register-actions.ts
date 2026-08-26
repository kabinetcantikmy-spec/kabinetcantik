"use server";
import { createServiceClient, supabaseReady } from "@/lib/supabase";
import { sendEmail, emailShell } from "@/lib/email";
import { resolveOrgId } from "@/lib/tenant";
import { tenantBrand } from "@/lib/branding";
import { headers } from "next/headers";

type Res = { ok: boolean; error?: string };

export async function registerSupplier(input: {
  nama: string;
  syarikat?: string;
  no_ssm?: string;
  telefon?: string;
  emel: string;
  bank?: string;
  no_akaun?: string;
  jenis?: string;
  password: string;
}): Promise<Res> {
  if (!supabaseReady()) return { ok: false, error: "Sistem tidak tersedia." };
  if (!input.nama.trim() || !input.emel.trim() || !input.password) {
    return { ok: false, error: "Nama, emel & kata laluan wajib." };
  }
  if (input.password.length < 6) return { ok: false, error: "Kata laluan minimum 6 aksara." };

  const sb = createServiceClient();
  const brand = await tenantBrand(await resolveOrgId((await headers()).get("host")));

  // 1) Cipta akaun auth
  const { data: created, error: authErr } = await sb.auth.admin.createUser({
    email: input.emel.trim(),
    password: input.password,
    email_confirm: true,
  });
  if (authErr || !created?.user) {
    return { ok: false, error: authErr?.message || "Emel mungkin telah didaftarkan." };
  }

  // 2) Cipta rekod supplier (pending)
  const { data: sup, error: supErr } = await sb
    .from("suppliers")
    .insert({
      nama: input.nama.trim(),
      syarikat: input.syarikat || null,
      no_ssm: input.no_ssm || null,
      telefon: input.telefon || null,
      emel: input.emel.trim(),
      bank: input.bank || null,
      no_akaun: input.no_akaun || null,
      jenis: input.jenis === "installer" ? "installer" : "pembekal",
      status: "pending",
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
  });

  // 4) Emel pengesahan
  await sendEmail({
    to: input.emel.trim(),
    fromName: brand.nama,
    subject: `Pendaftaran pembekal diterima — ${brand.nama}`,
    html: emailShell("Terima kasih mendaftar", `Permohonan anda sedang disemak. Kami akan maklumkan sebaik sahaja akaun anda diluluskan. Anda boleh log masuk di <b>/pembekal/login</b>.`, brand.nama),
  });

  return { ok: true };
}
