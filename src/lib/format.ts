export function rm(n: number | null | undefined): string {
  return "RM" + Math.round(Number(n) || 0).toLocaleString("en-MY");
}

export function rm2(n: number | null | undefined): string {
  return "RM" + (Number(n) || 0).toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function fmtDate(d: string | Date | null | undefined): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("ms-MY", { day: "2-digit", month: "short", year: "numeric" });
}

export function fmtDateTime(d: string | Date | null | undefined): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleString("ms-MY", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}
