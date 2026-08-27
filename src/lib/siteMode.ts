import { currentOrg } from "@/lib/tenant";
import { planForOrg } from "@/lib/planServer";

/**
 * Fasa percuma ("launch"): laman awam (marketing) untuk subdomain tenant DIMATIKAN.
 * Subdomain tenant → borang Sebut Harga sahaja. KC root (isDefault) TIDAK terjejas.
 */
export async function marketingOff(): Promise<boolean> {
  const { orgId, isDefault } = await currentOrg();
  if (isDefault) return false;
  const { plan } = await planForOrg(orgId);
  return plan === "launch";
}
