// Email transaksi via Resend. No-op yang selamat jika RESEND_API_KEY tiada.
const KEY = process.env.RESEND_API_KEY || "";
const FROM = process.env.RESEND_FROM || "KabinetCantik <noreply@kabinetcantik.com>";

export function emailReady(): boolean {
  return Boolean(KEY);
}

export interface SendEmailInput {
  to: string | string[];
  subject: string;
  html: string;
}

export async function sendEmail(input: SendEmailInput): Promise<{ ok: boolean; error?: string }> {
  if (!KEY) return { ok: false, error: "RESEND_API_KEY tiada (email dilangkau)." };
  const to = Array.isArray(input.to) ? input.to : [input.to];
  if (!to[0]) return { ok: false, error: "Tiada penerima." };
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: FROM, to, subject: input.subject, html: input.html }),
    });
    if (!res.ok) {
      const t = await res.text();
      return { ok: false, error: `Resend ${res.status}: ${t.slice(0, 120)}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Email gagal." };
  }
}

/** Templat HTML ringkas berjenama. */
export function emailShell(title: string, body: string): string {
  return `<div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;background:#FAF8F4;padding:24px;border-radius:12px">
    <div style="border-bottom:2px solid #AE873B;padding-bottom:12px;margin-bottom:16px">
      <span style="font-weight:700;letter-spacing:2px;color:#0B1320">KABINET CANTIK</span>
    </div>
    <h2 style="color:#0B1320;margin:0 0 8px">${title}</h2>
    <div style="color:#3a3a3a;line-height:1.6;font-size:15px">${body}</div>
    <p style="margin-top:24px;color:#9a9a9a;font-size:12px">KabinetCantik · Klang Valley</p>
  </div>`;
}
