// WhatsApp helpers — MVP guna wa.me deep link.

/** Normalisasi nombor telefon MY ke format antarabangsa tanpa '+'. */
export function normalizeMyPhone(input: string): string {
  let d = (input || "").replace(/[^\d]/g, "");
  if (d.startsWith("0")) d = "60" + d.slice(1);
  else if (d.startsWith("60")) d = d;
  else if (d.length >= 9 && d.length <= 10) d = "60" + d; // andai nombor tempatan tanpa 0
  return d;
}

const SALES = process.env.NEXT_PUBLIC_WHATSAPP_SALES || "60123456789";

/** Link wa.me ke sales dengan mesej pra-isi. */
export function waSalesLink(message: string): string {
  return `https://wa.me/${normalizeMyPhone(SALES)}?text=${encodeURIComponent(message)}`;
}

/** Link wa.me ke mana-mana nombor. */
export function waLink(phone: string, message = ""): string {
  const base = `https://wa.me/${normalizeMyPhone(phone)}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
