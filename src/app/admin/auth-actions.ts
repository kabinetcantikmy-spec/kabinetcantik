"use server";
import { createSupabaseServer } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";

export async function signOut() {
  const supabase = createSupabaseServer();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
