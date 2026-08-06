// CHIP Collect API — integrasi pembayaran (deposit/progress/final).
// Docs: https://docs.chip-in.asia/  (Purchases API)
import crypto from "crypto";

const BASE = process.env.CHIP_API_BASE || "https://gate.chip-in.asia/api/v1";
const SECRET = process.env.CHIP_SECRET_KEY || "";
const BRAND = process.env.CHIP_BRAND_ID || "";

export function chipReady(): boolean {
  return Boolean(SECRET && BRAND);
}

export interface CreatePurchaseInput {
  amount: number; // dalam RM (akan ditukar ke sen)
  email: string;
  fullName?: string;
  reference: string; // rujukan dalaman (payment id)
  title: string;
  successUrl: string;
  failureUrl: string;
  callbackUrl: string;
}

export interface CreatePurchaseResult {
  ok: boolean;
  id?: string;
  checkoutUrl?: string;
  error?: string;
}

export async function createPurchase(input: CreatePurchaseInput): Promise<CreatePurchaseResult> {
  if (!chipReady()) return { ok: false, error: "CHIP belum dikonfigurasi." };
  try {
    const res = await fetch(`${BASE}/purchases/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SECRET}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        brand_id: BRAND,
        client: { email: input.email, full_name: input.fullName || undefined },
        purchase: {
          currency: "MYR",
          products: [{ name: input.title, price: Math.round(input.amount * 100) }],
        },
        reference: input.reference,
        success_redirect: input.successUrl,
        failure_redirect: input.failureUrl,
        success_callback: input.callbackUrl,
        send_receipt: true,
      }),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data?.message || `CHIP error ${res.status}` };
    return { ok: true, id: data.id, checkoutUrl: data.checkout_url };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "CHIP request gagal." };
  }
}

/**
 * Verify webhook signature CHIP (RSA-SHA256 pada raw body, base64).
 * Set CHIP_WEBHOOK_PUBLIC_KEY (PEM) dari dashboard CHIP.
 */
export function verifyWebhook(rawBody: string, signature: string | null): boolean {
  const pubKey = process.env.CHIP_WEBHOOK_PUBLIC_KEY || "";
  if (!pubKey || !signature) return false;
  try {
    const verifier = crypto.createVerify("sha256");
    verifier.update(rawBody);
    verifier.end();
    return verifier.verify(pubKey, Buffer.from(signature, "base64"));
  } catch {
    return false;
  }
}
