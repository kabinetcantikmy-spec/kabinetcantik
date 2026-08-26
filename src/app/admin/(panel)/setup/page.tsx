import { requireStaff } from "@/lib/supabaseServer";
import { tenantBrand } from "@/lib/branding";
import { loadHomepageConfig } from "@/lib/homepageServer";
import { loadBusiness, loadOnboarding } from "@/lib/onboardingServer";
import SetupJourney from "@/components/admin/SetupJourney";

export const dynamic = "force-dynamic";

export default async function SetupPage() {
  const staff = await requireStaff();
  const [business, onboarding, brand, homepage] = await Promise.all([
    loadBusiness(),
    loadOnboarding(),
    tenantBrand(staff.orgId),
    loadHomepageConfig(null, staff.isPlatformAdmin),
  ]);

  return (
    <div>
      <h1 className="h-display text-2xl">Setup Kedai</h1>
      <p className="mt-1 text-sm text-ink/50">Lengkapkan langkah demi langkah untuk melancarkan kedai anda.</p>
      <div className="mt-6">
        <SetupJourney
          orgId={staff.orgId || ""}
          business={business}
          steps={onboarding.steps}
          brand={{ nama: brand.nama, logoUrl: brand.logoUrl }}
          homepage={homepage}
        />
      </div>
    </div>
  );
}
