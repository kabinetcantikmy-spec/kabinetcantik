import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabaseServer";
import { supabaseReady } from "@/lib/supabase";
import { fmtDate } from "@/lib/format";

export const dynamic = "force-dynamic";

interface CustomerRow {
  id: string;
  nama: string;
  telefon: string | null;
  emel: string | null;
  created_at: string;
  projects?: { id: string }[] | null;
}

export default async function PelangganPage() {
  let customers: CustomerRow[] = [];
  if (supabaseReady()) {
    const sb = createSupabaseServer();
    const { data } = await sb
      .from("customers")
      .select("id, nama, telefon, emel, created_at, projects(id)")
      .order("created_at", { ascending: false });
    customers = (data || []) as CustomerRow[];
  }

  return (
    <div>
      <h1 className="h-display text-2xl">Pelanggan</h1>
      <p className="mt-1 text-sm text-ink/50">Pelanggan dicipta automatik apabila projek dimulakan.</p>

      {!supabaseReady() ? (
        <div className="mt-6 rounded-xl border border-dashed border-ink/20 bg-white p-8 text-center text-ink/50">Supabase belum dikonfigurasi.</div>
      ) : customers.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-ink/20 bg-white p-8 text-center text-ink/50">Belum ada pelanggan.</div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-ink/10 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-ink/[0.03] text-left text-xs uppercase tracking-wider text-ink/50">
              <tr><th className="px-4 py-3">Nama</th><th className="px-4 py-3">Telefon</th><th className="px-4 py-3">Emel</th><th className="px-4 py-3 text-center">Projek</th><th className="px-4 py-3">Sejak</th></tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="border-t border-ink/5">
                  <td className="px-4 py-3 font-medium text-ink">{c.nama}</td>
                  <td className="px-4 py-3 text-ink/70">{c.telefon || "—"}</td>
                  <td className="px-4 py-3 text-ink/70">{c.emel || "—"}</td>
                  <td className="px-4 py-3 text-center">
                    <Link href="/admin/projek" className="text-brass hover:underline">{c.projects?.length || 0}</Link>
                  </td>
                  <td className="px-4 py-3 text-ink/50">{fmtDate(c.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
