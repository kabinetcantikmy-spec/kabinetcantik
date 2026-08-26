import { createServerClient } from "@supabase/ssr";
import { cookies, type UnsafeUnwrappedCookies } from "next/headers";
import { redirect } from "next/navigation";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

/** Supabase client terikat kepada sesi pengguna (cookies). Guna dalam server components / actions. */
export function createSupabaseServer() {
  const cookieStore = (cookies() as unknown as UnsafeUnwrappedCookies);
  return createServerClient(url, anon, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: Record<string, unknown>) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch {
          // Dipanggil dari Server Component — abaikan (middleware akan segarkan).
        }
      },
      remove(name: string, options: Record<string, unknown>) {
        try {
          cookieStore.set({ name, value: "", ...options });
        } catch {
          /* noop */
        }
      },
    },
  });
}

export type StaffRole = "admin" | "sales" | "finance" | "designer" | "installer";

export interface StaffContext {
  userId: string;
  emel: string;
  nama: string;
  role: StaffRole;
  orgId: string | null;
}

/** Pastikan pengguna log masuk & staf. Redirect ke /admin/login jika tidak. */
export async function requireStaff(): Promise<StaffContext> {
  const supabase = createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("nama, emel, role, org_id")
    .eq("id", user.id)
    .single();

  const role = (profile?.role || "customer") as string;
  const staffRoles = ["admin", "sales", "finance", "designer", "installer"];
  if (!staffRoles.includes(role)) redirect("/admin/login?e=akses");

  return {
    userId: user.id,
    emel: profile?.emel || user.email || "",
    nama: profile?.nama || user.email || "Staf",
    role: role as StaffRole,
    orgId: (profile?.org_id as string) || null,
  };
}

/** Pastikan staf log masuk DAN peranan dibenarkan. Redirect jika tidak. */
export async function requireRole(roles: StaffRole[]): Promise<StaffContext> {
  const staff = await requireStaff();
  if (!roles.includes(staff.role)) redirect("/admin?e=peranan");
  return staff;
}

export interface CustomerContext {
  userId: string;
  customerId: string;
  emel: string;
  nama: string;
}

/** Pastikan pengguna log masuk & pelanggan (ada customer_id). Redirect ke /portal/login jika tidak. */
export async function requireCustomer(): Promise<CustomerContext> {
  const supabase = createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/portal/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("nama, emel, customer_id")
    .eq("id", user.id)
    .single();

  if (!profile?.customer_id) redirect("/portal/login?e=akaun");

  return {
    userId: user.id,
    customerId: profile.customer_id as string,
    emel: profile.emel || user.email || "",
    nama: profile.nama || user.email || "Pelanggan",
  };
}

export interface SupplierContext {
  userId: string;
  supplierId: string;
  emel: string;
  nama: string;
}

/** Pastikan pengguna log masuk & pembekal (ada supplier_id). Redirect ke /pembekal/login jika tidak. */
export async function requireSupplier(): Promise<SupplierContext> {
  const supabase = createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/pembekal/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("nama, emel, supplier_id")
    .eq("id", user.id)
    .single();

  if (!profile?.supplier_id) redirect("/pembekal/login?e=akaun");

  return {
    userId: user.id,
    supplierId: profile.supplier_id as string,
    emel: profile.emel || user.email || "",
    nama: profile.nama || user.email || "Pembekal",
  };
}
