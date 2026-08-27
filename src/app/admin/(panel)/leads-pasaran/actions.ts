"use server";
import { requireStaff } from "@/lib/supabaseServer";
import { planForOrg } from "@/lib/planServer";
import { claimLead, type ClaimResult } from "@/lib/marketplaceServer";
import { revalidatePath } from "next/cache";

export async function claimMarketplaceLead(leadId: string): Promise<ClaimResult> {
  const staff = await requireStaff();
  if (!staff.orgId) return { ok: false, error: "Akaun anda belum dikaitkan dengan organisasi." };
  const { plan } = await planForOrg(staff.orgId);
  const r = await claimLead({ orgId: staff.orgId, userId: staff.userId, staffName: staff.nama, leadId, plan });
  if (r.ok) {
    revalidatePath("/admin/leads");
  }
  return r;
}
