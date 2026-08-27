import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/supabaseServer";
import { planForOrg } from "@/lib/planServer";

/**
 * Kunci route yang disorok semasa fasa percuma (plan "launch").
 * Platform admin (akaun owner) DIKECUALIKAN — akses penuh di mana-mana tenant.
 * Kontraktor biasa pada plan launch → dilencong balik ke dashboard.
 */
export async function guardLaunchLock() {
  const staff = await requireStaff();
  if (staff.isPlatformAdmin) return staff;
  const { plan } = await planForOrg(staff.orgId);
  if (plan === "launch") redirect("/admin?e=terkunci");
  return staff;
}
