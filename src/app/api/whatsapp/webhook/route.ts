import { NextRequest, NextResponse } from "next/server";
import { createServiceClient, supabaseReady } from "@/lib/supabase";

export const runtime = "nodejs";

// Pengesahan webhook Meta (semasa setup).
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const mode = sp.get("hub.mode");
  const token = sp.get("hub.verify_token");
  const challenge = sp.get("hub.challenge");
  if (mode === "subscribe" && token && token === (process.env.WHATSAPP_VERIFY_TOKEN || "")) {
    return new Response(challenge || "", { status: 200 });
  }
  return new Response("Forbidden", { status: 403 });
}

interface WaMessage { from?: string; text?: { body?: string }; type?: string }
interface WaStatus { id?: string; status?: string }

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: true });
  }
  if (!supabaseReady()) return NextResponse.json({ ok: true });
  const sb = createServiceClient();

  try {
    const entries = (body as { entry?: { changes?: { value?: { messages?: WaMessage[]; statuses?: WaStatus[] } }[] }[] }).entry || [];
    for (const e of entries) {
      for (const ch of e.changes || []) {
        const val = ch.value || {};

        // Mesej masuk dari pelanggan
        for (const m of val.messages || []) {
          const from = m.from || "";
          const text = m.text?.body || `(${m.type || "mesej"})`;
          // Padan lead ikut telefon (akhiran 8-9 digit)
          const tail = from.slice(-9);
          const { data: lead } = await sb.from("leads").select("id").ilike("telefon", `%${tail}`).limit(1).maybeSingle();
          await sb.from("wa_log").insert({ lead_id: lead?.id || null, telefon: from, arah: "masuk", jenis: "reply", mesej: text, status: "received" });
          if (lead?.id) {
            await sb.from("lead_activity").insert({ lead_id: lead.id, jenis: "note", mesej: `📱 WhatsApp masuk: ${text}` });
          }
        }

        // Status penghantaran
        for (const s of val.statuses || []) {
          if (s.id && s.status) {
            await sb.from("wa_log").update({ status: s.status }).eq("ref", s.id);
          }
        }
      }
    }
  } catch {
    /* best-effort */
  }
  return NextResponse.json({ ok: true });
}
