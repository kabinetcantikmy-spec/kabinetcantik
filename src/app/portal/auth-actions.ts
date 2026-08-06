"use server";
import { createSupabaseServer } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";

export async function signOutPortal() {
  const supabase = createSupabaseServer();
  await supabase.auth.signOut();
  redirect("/portal/login");
}
