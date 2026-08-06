"use server";
import { createServiceClient, supabaseReady } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

type Res = { ok: boolean; error?: string };

export async function markQuoteViewed(token: string): Promise<void> {
  if (!supabaseReady() || !token) return;
  const sb = createServiceClient();
  const { data } = await sb.from("quotations").select("id, viewed_at, status").eq("share_token", token).single();
  if (data && !data.viewed_at) {
    const patch: Record<string, unknown> = { viewed_at: new Date().toISOString() };
    if (data.status === "sent") {
      /* kekal 'sent' */
    }
    await sb.from("quotations").update(patch).eq("id", data.id);
  }
}

export async function acceptQuote(token: string): Promise<Res> {
  if (!supabaseReady() || !token) return { ok: false, error: "Pautan tidak sah." };
  const sb = createServiceClient();
  const { data: q } = await sb.from("quotations").select("id, lead_id, status").eq("share_token", token).single();
  if (!q) return { ok: false, error: "Sebut harga tidak dijumpai." };
  if (q.status === "accepted") return { ok: true };
  const { error } = await sb
    .from("quotations")
    .update({ status: "accepted", accepted_at: new Date().toISOString() })
    .eq("id", q.id);
  if (error) return { ok: false, error: error.message };
  // Gerakkan lead ke peringkat Sebut Harga (diterima)
  if (q.lead_id) {
    await sb.from("leads").update({ stage: "Sebut Harga" }).eq("id", q.lead_id);
    await sb.from("lead_activity").insert({ lead_id: q.lead_id, jenis: "quote", mesej: "Pelanggan TERIMA sebut harga secara online." });
  }
  revalidatePath("/admin/sebutharga");
  return { ok: true };
}
