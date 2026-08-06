"use client";
export default function PrintButton() {
  return (
    <button onClick={() => window.print()} className="btn-brass !px-4 !py-2 text-sm print:hidden">
      Cetak / Simpan PDF
    </button>
  );
}
