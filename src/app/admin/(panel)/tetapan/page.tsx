import { createSupabaseServer, requireRole, requireStaff } from "@/lib/supabaseServer";
import { supabaseReady } from "@/lib/supabase";
import { loadPricingConfig } from "@/lib/pricingServer";
import { loadHomepageConfig } from "@/lib/homepageServer";
import { loadServices, loadMaterials, loadPortfolioPage, loadBlogPage, loadContactPage, loadPrivacyPage } from "@/lib/siteContentServer";
import { tenantBrand } from "@/lib/branding";
import SettingsEditor, { StaffUser } from "@/components/admin/SettingsEditor";
import HomepageEditor from "@/components/admin/HomepageEditor";
import BrandingEditor from "@/components/admin/BrandingEditor";
import ServicesEditor from "@/components/admin/ServicesEditor";
import MaterialsPageEditor from "@/components/admin/MaterialsPageEditor";
import PortfolioPageEditor from "@/components/admin/PortfolioPageEditor";
import BlogPageEditor from "@/components/admin/BlogPageEditor";
import ContactPageEditor from "@/components/admin/ContactPageEditor";
import PrivacyPageEditor from "@/components/admin/PrivacyPageEditor";
import TetapanSections from "@/components/admin/TetapanSections";

export const dynamic = "force-dynamic";

export default async function TetapanPage() {
  await requireRole(["admin"]);
  const staff = await requireStaff();
  const config = await loadPricingConfig();
  const homepage = await loadHomepageConfig(null, staff.isPlatformAdmin);
  const services = await loadServices(null);
  const materials = await loadMaterials(null);
  const portfolioPage = await loadPortfolioPage(null);
  const blogPage = await loadBlogPage(null);
  const contactPage = await loadContactPage(null);
  const privacyPage = await loadPrivacyPage(null);
  const brand = await tenantBrand(staff.orgId);
  let users: StaffUser[] = [];
  let waEnabled = false;
  if (supabaseReady()) {
    const sb = createSupabaseServer();
    const { data } = await sb.from("profiles").select("id, nama, emel, role").order("role");
    users = (data || []) as StaffUser[];
    const { data: waRow } = await sb.from("settings").select("value").eq("key", "wa_automation_enabled").single();
    waEnabled = waRow?.value === true;
  }

  return (
    <div>
      <h1 className="h-display text-2xl">Tetapan</h1>
      <p className="mt-1 text-sm text-ink/50">Kadar harga, cukai, deposit & pengurusan pengguna (admin sahaja).</p>
      <div className="mt-6">
        <TetapanSections
          labels={[
            "Jenama & Logo",
            "Homepage (Laman Awam)",
            "Perkhidmatan",
            "Bahan & Kemasan",
            "Portfolio",
            "Blog",
            "Hubungi (Contact)",
            "Dasar Privasi",
            "Kadar, Pengguna & WhatsApp",
          ]}
        >
          <BrandingEditor initial={{ nama: brand.nama, logoUrl: brand.logoUrl }} orgId={staff.orgId || ""} />
          <HomepageEditor initial={homepage} />
          <ServicesEditor initial={services} />
          <MaterialsPageEditor initial={materials} />
          <PortfolioPageEditor initial={portfolioPage} />
          <BlogPageEditor initial={blogPage} />
          <ContactPageEditor initial={contactPage} />
          <PrivacyPageEditor initial={privacyPage} />
          <SettingsEditor config={config} users={users} waEnabled={waEnabled} />
        </TetapanSections>
      </div>
    </div>
  );
}
