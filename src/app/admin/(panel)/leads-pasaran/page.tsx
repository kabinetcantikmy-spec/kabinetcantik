import { requireStaff } from "@/lib/supabaseServer";
import { planForOrg } from "@/lib/planServer";
import { listAvailableLeads, leadUsage } from "@/lib/marketplaceServer";
import LeadsPasaranBoard from "@/components/admin/LeadsPasaranBoard";

export const dynamic = "force-dynamic";

export default async function LeadsPasaranPage() {
  const staff = await requireStaff();
  const { plan } = await planForOrg(staff.orgId);
  const [leads, usage] = await Promise.all([
    listAvailableLeads(),
    leadUsage(staff.orgId, plan),
  ]);
  return <LeadsPasaranBoard leads={leads} usage={usage} />;
}
