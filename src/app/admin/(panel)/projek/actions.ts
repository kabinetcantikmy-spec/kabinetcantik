"use server";
import crypto from "crypto";
import { createServiceClient, supabaseReady } from "@/lib/supabase";
import { requireStaff, createSupabaseServer } from "@/lib/supabaseServer";
import { sendEmail, emailShell } from "@/lib/email";
import { tenantBrand } from "@/lib/branding";
import { tenantBaseUrl } from "@/lib/tenant";
import { waLink } from "@/lib/wa";
import { waReview } from "@/lib/whatsapp";
import { revalidatePath } from "next/cache";

type Res = { ok: boolean; error?: string; id?: string; waLink?: string };

/** Cipta projek dari sebut harga yang diterima. Auto: customer + deposit payment. */
export async function createProjectFromQuote(quotationId: string): Promise<Res> {
  const staff = await requireStaff();
  if (!supabaseReady()) return { ok: false, error: "Supabase belum dikonfigurasi." };
  const sb = createSupabaseServer();

  const { data: q } = await sb
    .from("quotations")
    .select("id, jumlah, deposit_pct, lead_id, leads(nama, telefon, emel)")
    .eq("id", quotationId)
    .single();
  if (!q) return { ok: false, error: "Sebut harga tidak dijumpai." };
  const lead = (q as unknown as { leads?: { nama: string; telefon: string; emel: string | null } }).leads;

  // Cari/buat customer
  let customerId: string | null = null;
  if (lead?.telefon) {
    const { data: existing } = await sb.from("customers").select("id").eq("telefon", lead.telefon).limit(1);
    customerId = existing?.[0]?.id || null;
  }
  if (!customerId && lead) {
    const { data: c } = await sb
      .from("customers")
      .insert({ nama: lead.nama, telefon: lead.telefon, emel: lead.emel })
      .select("id")
      .single();
    customerId = c?.id || null;
  }

  const { data: proj, error } = await sb
    .from("projects")
    .insert({
      customer_id: customerId,
      lead_id: q.lead_id,
      quotation_id: q.id,
      tajuk: `Projek ${lead?.nama || ""}`.trim(),
      status: "Deposit",
      nilai_kontrak: q.jumlah,
      deposit_pct: q.deposit_pct,
      tarikh_mula: new Date().toISOString().slice(0, 10),
    })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };

  // Auto milestone: deposit
  const deposit = (Number(q.jumlah) * Number(q.deposit_pct)) / 100;
  await sb.from("payments").insert({ project_id: proj.id, jenis: "deposit", jumlah: deposit, status: "pending" });

  if (q.lead_id) await sb.from("leads").update({ stage: "Deposit" }).eq("id", q.lead_id);

  // Auto-jemput akaun pelanggan (portal) jika ada emel — tenant-branded via Resend.
  if (customerId && lead?.emel) {
    try {
      const admin = createServiceClient();
      // Pastikan akaun auth pelanggan wujud (email disahkan, tiada kata laluan lagi).
      await admin.auth.admin.createUser({ email: lead.emel, email_confirm: true }).catch(() => {});
      // Jana pautan log masuk portal (token_hash → /auth/callback).
      const { data: gl } = await admin.auth.admin.generateLink({ type: "magiclink", email: lead.emel });
      const uid = gl?.user?.id;
      const th = gl?.properties?.hashed_token;
      if (uid) {
        await admin.from("profiles").upsert({
          id: uid, nama: lead.nama, emel: lead.emel,
          role: "customer", customer_id: customerId, org_id: staff.orgId,
        });
      }
      if (th) {
        const brand = await tenantBrand(staff.orgId);
        const baseUrl = await tenantBaseUrl();
        const link = `${baseUrl}/auth/callback?token_hash=${encodeURIComponent(th)}&type=magiclink&next=/portal`;
        await sendEmail({
          to: lead.emel,
          fromName: brand.nama,
          subject: `Portal projek anda dah sedia — ${brand.nama}`,
          html: emailShell(
            "Selamat datang ke portal projek anda",
            `<p>Hai ${lead.nama || ""}, projek anda dengan <b>${brand.nama}</b> telah dimulakan.</p>
             <p>Pantau status projek, reka bentuk, bayaran &amp; warranti di portal pelanggan anda:</p>
             <p style="margin:20px 0"><a href="${link}" style="background:#AE873B;color:#fff;text-decoration:none;padding:12px 22px;border-radius:8px;font-weight:600;display:inline-block">Masuk Portal Saya</a></p>
             <p style="font-size:13px;color:#9a9a9a">Butang tak jadi? Salin pautan ni ke pelayar:<br>${link}</p>`,
            brand.nama
          ),
        });
      }
    } catch {
      // Jangan gagalkan penciptaan projek jika emel/jemputan gagal.
    }
  }

  revalidatePath("/admin/projek");
  return { ok: true, id: proj.id };
}

export async function updateProjectStatus(projectId: string, status: string): Promise<Res> {
  await requireStaff();
  if (!supabaseReady()) return { ok: false, error: "Supabase belum dikonfigurasi." };
  const sb = createSupabaseServer();
  const patch: Record<string, unknown> = { status };
  if (status === "Siap") patch.warranty_until = new Date(new Date().setFullYear(new Date().getFullYear() + 5)).toISOString().slice(0, 10);
  const { error } = await sb.from("projects").update(patch).eq("id", projectId);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/admin/projek/${projectId}`);
  return { ok: true };
}

export async function addPayment(projectId: string, jenis: string, jumlah: number): Promise<Res> {
  await requireStaff();
  if (!supabaseReady()) return { ok: false, error: "Supabase belum dikonfigurasi." };
  if (!jumlah || jumlah <= 0) return { ok: false, error: "Jumlah tidak sah." };
  const sb = createSupabaseServer();
  const { error } = await sb.from("payments").insert({ project_id: projectId, jenis, jumlah, status: "pending" });
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/admin/projek/${projectId}`);
  return { ok: true };
}

export async function addDesign(projectId: string, tajuk: string, imageUrl: string): Promise<Res> {
  await requireStaff();
  if (!supabaseReady()) return { ok: false, error: "Supabase belum dikonfigurasi." };
  if (!imageUrl.trim()) return { ok: false, error: "Pautan imej wajib." };
  const sb = createSupabaseServer();
  const { error } = await sb.from("project_designs").insert({ project_id: projectId, tajuk: tajuk || null, image_url: imageUrl.trim(), status: "pending" });
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/admin/projek/${projectId}`);
  return { ok: true };
}

/** Jana token review, simpan, dan pulangkan pautan WA + hantar email jemputan review. */
export async function requestReview(projectId: string): Promise<Res> {
  const staff = await requireStaff();
  if (!supabaseReady()) return { ok: false, error: "Supabase belum dikonfigurasi." };
  const sb = createSupabaseServer();
  const brand = await tenantBrand(staff.orgId);
  const { data: proj } = await sb
    .from("projects")
    .select("id, tajuk, review_token, customers(nama, telefon, emel)")
    .eq("id", projectId)
    .single();
  if (!proj) return { ok: false, error: "Projek tidak dijumpai." };
  const cust = (proj as unknown as { customers?: { nama: string; telefon: string; emel: string | null } }).customers;

  const token = proj.review_token || crypto.randomUUID();
  await sb.from("projects").update({ review_token: token }).eq("id", projectId);

  const baseUrl = await tenantBaseUrl();
  const link = `${baseUrl}/ulasan/baru/${token}`;
  const msg = `Hai ${cust?.nama || ""}, terima kasih memilih ${brand.nama}! Kongsi pengalaman anda di sini: ${link}`;

  if (cust?.emel) {
    await sendEmail({
      to: cust.emel,
      fromName: brand.nama,
      subject: `Kongsi ulasan projek anda — ${brand.nama}`,
      html: emailShell(
        "Bagaimana projek anda?",
        `Terima kasih memilih ${brand.nama}. Kami hargai jika anda luangkan seminit untuk kongsi ulasan:<br><br>
         <a href="${link}" style="background:#AE873B;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none">Tulis Ulasan</a>`,
        brand.nama
      ),
    });
  }

  // WhatsApp automatik (jika automasi on) — selain link manual di bawah
  if (cust?.telefon) await waReview(cust.telefon, cust?.nama || "", link);

  const wa = cust?.telefon ? waLink(cust.telefon, msg) : undefined;
  revalidatePath(`/admin/projek/${projectId}`);
  return { ok: true, waLink: wa };
}

export async function updateWarrantyStatus(claimId: string, projectId: string, status: string, tindakan?: string): Promise<Res> {
  await requireStaff();
  if (!supabaseReady()) return { ok: false, error: "Supabase belum dikonfigurasi." };
  const sb = createSupabaseServer();
  const { error } = await sb.from("warranty_claims").update({ status, tindakan: tindakan || null }).eq("id", claimId);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/admin/projek/${projectId}`);
  return { ok: true };
}
