"use client";
import { useFormState, useFormStatus } from "react-dom";
import { createTenant, type CreateTenantState } from "./actions";

function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <button disabled={pending} className="btn-brass text-sm disabled:opacity-60">
      {pending ? "Mencipta…" : "Cipta akaun admin"}
    </button>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2">
      <span className="text-ink/50">{label}</span>
      <span className="select-all font-mono text-ink">{value}</span>
    </div>
  );
}

export default function CreateTenantForm() {
  const [state, action] = useFormState<CreateTenantState, FormData>(createTenant, null);

  return (
    <div className="mt-6 rounded-xl border border-ink/10 bg-white p-5">
      <h2 className="font-display text-lg font-semibold">Cipta tenant baru</h2>
      <form action={action} className="mt-4 grid gap-3 sm:grid-cols-4">
        <input name="nama" required placeholder="Nama syarikat" className="rounded-lg border border-ink/15 bg-paper px-3 py-2 text-sm" />
        <input name="slug" required placeholder="slug (cth: melecun)" className="rounded-lg border border-ink/15 bg-paper px-3 py-2 text-sm" />
        <input name="email" type="email" required placeholder="Emel admin syarikat" className="rounded-lg border border-ink/15 bg-paper px-3 py-2 text-sm" />
        <SubmitBtn />
      </form>
      <p className="mt-2 text-xs text-ink/40">
        Trial 14 hari dimulakan automatik. Alamat: <span className="font-mono">slug.kabinetcantik.com</span>
      </p>

      {state && !state.ok && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}

      {state && state.ok && (
        <div className="mt-4 rounded-xl border border-emerald-300 bg-emerald-50 p-4">
          <div className="text-sm font-semibold text-emerald-900">
            ✓ Tenant “{state.nama}” siap.{" "}
            {state.existing ? "Akaun sedia ada — kata laluan di-reset." : "Akaun admin dicipta."}
          </div>
          <p className="mt-1 text-xs text-emerald-800">
            Serahkan butiran log masuk ni kepada pelanggan. Kata laluan dipapar sekali ni sahaja —
            salin sekarang.
          </p>
          <div className="mt-3 grid gap-2 text-sm">
            <Row label="Log masuk" value="kabinetcantik.com/admin/login" />
            <Row label="Emel" value={state.email} />
            <Row label="Kata laluan" value={state.password} />
          </div>
          <p className="mt-2 text-xs text-emerald-700">
            Nasihatkan pelanggan tukar kata laluan selepas log masuk pertama.
          </p>
        </div>
      )}
    </div>
  );
}
