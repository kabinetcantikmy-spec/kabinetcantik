import { headers } from "next/headers";
import { hostBrand } from "@/lib/branding";
import SupplierLoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function Page(props: { searchParams: Promise<{ e?: string }> }) {
  const sp = await props.searchParams;
  const brand = await hostBrand((await headers()).get("host"));
  const notice = sp?.e === "akaun"
    ? "Akaun ini bukan akaun pembekal. Kalau anda staf syarikat, guna Panel Admin. Kalau belum daftar sebagai pembekal, tekan “Daftar di sini”."
    : "";
  return <SupplierLoginForm brand={{ nama: brand.nama, logoUrl: brand.logoUrl }} notice={notice} />;
}
