// WhatsApp Business API — Meta Cloud API.
// Semua fungsi selamat no-op jika tak dikonfigurasi / automasi off.
import { createServiceClient, supabaseReady } from "@/lib/supabase";
import { normalizeMyPhone } from "@/lib/wa";

const PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || "";
const TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || "";
const VERSION = process.env.WHATSAPP_API_VERSION || "v21.0";
const LANG = process.env.WA_TPL_LANG || "ms";

export const WA_TEMPLATES = {
  lead: process.env.WA_TPL_LEAD || "lead_welcome",
  stage: process.env.WA_TPL_STAGE || "stage_update",
  payment: process.env.WA_TPL_PAYMENT || "payment_received",
  appointment: process.env.WA_TPL_APPOINTMENT || "appointment_reminder",
  review: process.env.WA_TPL_REVIEW || "project_review",
};

export function waReady(): boolean {
  return Boolean(PHONE_ID && TOKEN);
}

/** Adakah automasi WA dihidupkan dalam tetapan? */
export async function isWaAutomationOn(): Promise<boolean> {
  if (!waReady() || !supabaseReady()) return false;
  try {
    const sb = createServiceClient();
    const { data } = await sb.from("settings").select("value").eq("key", "wa_automation_enabled").single();
    return data?.value === true;
  } catch {
    return false;
  }
}

async function logWa(entry: {
  lead_id?: string | null;
  telefon: string;
  jenis: string;
  template?: string;
  mesej?: string;
  status: string;
  ref?: string | null;
}) {
  if (!supabaseReady()) return;
  try {
    const sb = createServiceClient();
    await sb.from("wa_log").insert({
      lead_id: entry.lead_id || null,
      telefon: entry.telefon,
      arah: "keluar",
      jenis: entry.jenis,
      template: entry.template || null,
      mesej: entry.mesej || null,
      status: entry.status,
      ref: entry.ref || null,
    });
  } catch {
    /* noop */
  }
}

interface SendResult {
  ok: boolean;
  id?: string;
  error?: string;
}

async function callMeta(body: Record<string, unknown>): Promise<SendResult> {
  try {
    const res = await fetch(`https://graph.facebook.com/${VERSION}/${PHONE_ID}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({ messaging_product: "whatsapp", ...body }),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data?.error?.message || `Meta ${res.status}` };
    return { ok: true, id: data?.messages?.[0]?.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "WA request gagal." };
  }
}

/** Hantar template message (untuk mesej bisnes-initiated). bodyParams = pembolehubah {{1}},{{2}}… */
export async function sendTemplate(
  to: string,
  templateName: string,
  bodyParams: string[] = [],
  opts?: { jenis?: string; leadId?: string | null }
): Promise<SendResult> {
  if (!waReady()) return { ok: false, error: "WA tidak dikonfigurasi." };
  const phone = normalizeMyPhone(to);
  const components = bodyParams.length
    ? [{ type: "body", parameters: bodyParams.map((t) => ({ type: "text", text: t })) }]
    : undefined;
  const result = await callMeta({
    to: phone,
    type: "template",
    template: { name: templateName, language: { code: LANG }, ...(components ? { components } : {}) },
  });
  await logWa({ telefon: phone, jenis: opts?.jenis || "template", template: templateName, mesej: bodyParams.join(" | "), status: result.ok ? "sent" : "failed", ref: result.id, lead_id: opts?.leadId });
  return result;
}

/** Hantar mesej teks (hanya sah dalam tetingkap 24 jam selepas pelanggan mesej). */
export async function sendText(to: string, bodyText: string, opts?: { jenis?: string; leadId?: string | null }): Promise<SendResult> {
  if (!waReady()) return { ok: false, error: "WA tidak dikonfigurasi." };
  const phone = normalizeMyPhone(to);
  const result = await callMeta({ to: phone, type: "text", text: { body: bodyText } });
  await logWa({ telefon: phone, jenis: opts?.jenis || "text", mesej: bodyText, status: result.ok ? "sent" : "failed", ref: result.id, lead_id: opts?.leadId });
  return result;
}

// ---------- Event helpers (guna dalam server actions / routes) ----------

export async function waLeadWelcome(to: string, nama: string, leadId?: string) {
  if (!(await isWaAutomationOn())) return;
  await sendTemplate(to, WA_TEMPLATES.lead, [nama], { jenis: "lead", leadId });
}

export async function waStageUpdate(to: string, nama: string, stage: string, leadId?: string) {
  if (!(await isWaAutomationOn())) return;
  await sendTemplate(to, WA_TEMPLATES.stage, [nama, stage], { jenis: "stage", leadId });
}

export async function waPayment(to: string, nama: string, amount: string, leadId?: string) {
  if (!(await isWaAutomationOn())) return;
  await sendTemplate(to, WA_TEMPLATES.payment, [nama, amount], { jenis: "payment", leadId });
}

export async function waAppointment(to: string, nama: string, tarikh: string, leadId?: string) {
  if (!(await isWaAutomationOn())) return;
  await sendTemplate(to, WA_TEMPLATES.appointment, [nama, tarikh], { jenis: "appointment", leadId });
}

export async function waReview(to: string, nama: string, link: string, leadId?: string) {
  if (!(await isWaAutomationOn())) return;
  await sendTemplate(to, WA_TEMPLATES.review, [nama, link], { jenis: "review", leadId });
}
