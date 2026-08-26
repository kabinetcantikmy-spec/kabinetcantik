"use server";
import { supabaseReady } from "@/lib/supabase";
import { createSupabaseServer, requireStaff } from "@/lib/supabaseServer";
import { BusinessInfo, OnboardingState } from "@/lib/onboarding";
import { revalidatePath } from "next/cache";

type Res = { ok: boolean; error?: string };

async function currentOnboarding(sb: ReturnType<typeof createSupabaseServer>): Promise<OnboardingState> {
  const { data } = await sb.from("settings").select("value").eq("key", "onboarding").limit(1).maybeSingle();
  const v = data?.value as Partial<OnboardingState> | undefined;
  return { done: Boolean(v?.done), steps: (v?.steps as Record<string, boolean>) || {} };
}

export async function saveBusiness(info: BusinessInfo): Promise<Res> {
  await requireStaff();
  if (!supabaseReady()) return { ok: false, error: "Supabase belum dikonfigurasi." };
  if (!info.namaSah?.trim()) return { ok: false, error: "Nama perniagaan wajib." };
  const sb = createSupabaseServer();
  const { error } = await sb.from("settings").upsert({ key: "business", value: info }, { onConflict: "org_id,key" });
  if (error) return { ok: false, error: error.message };
  const ob = await currentOnboarding(sb);
  ob.steps.perniagaan = true;
  await sb.from("settings").upsert({ key: "onboarding", value: ob }, { onConflict: "org_id,key" });
  revalidatePath("/admin/setup");
  revalidatePath("/admin");
  return { ok: true };
}

export async function markStep(step: string, done = true): Promise<Res> {
  await requireStaff();
  if (!supabaseReady()) return { ok: false, error: "Supabase belum dikonfigurasi." };
  const sb = createSupabaseServer();
  const ob = await currentOnboarding(sb);
  ob.steps[step] = done;
  const { error } = await sb.from("settings").upsert({ key: "onboarding", value: ob }, { onConflict: "org_id,key" });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/setup");
  revalidatePath("/admin");
  return { ok: true };
}

export async function finishOnboarding(): Promise<Res> {
  await requireStaff();
  if (!supabaseReady()) return { ok: false, error: "Supabase belum dikonfigurasi." };
  const sb = createSupabaseServer();
  const ob = await currentOnboarding(sb);
  ob.done = true;
  const { error } = await sb.from("settings").upsert({ key: "onboarding", value: ob }, { onConflict: "org_id,key" });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/setup");
  revalidatePath("/admin");
  return { ok: true };
}
