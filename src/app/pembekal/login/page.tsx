import { headers } from "next/headers";
import { hostBrand } from "@/lib/branding";
import SupplierLoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function Page() {
  const brand = await hostBrand((await headers()).get("host"));
  return <SupplierLoginForm brand={{ nama: brand.nama, logoUrl: brand.logoUrl }} />;
}
