"use server";

import { redirect } from "next/navigation";
import { createSupabaseWithAccess, readAccessToken } from "@/lib/supabase/auth-session";

export async function cancelAttendanceAction(formData: FormData) {
  const text = String(formData.get("reason") ?? "").trim();
  if (text.length < 1 || text.length > 280) redirect("/onboarding?error=motivo");
  const token = await readAccessToken();
  if (!token) redirect("/login?next=/onboarding");
  const cancelled = await createSupabaseWithAccess(token).rpc("cancel_my_attendance", { p_reason: text });
  if (cancelled.error?.message.includes("todavia_no_ocupa")) redirect("/onboarding?error=todavia_no_ocupa");
  if (cancelled.error?.message.includes("ya_cancelo")) redirect("/onboarding?error=ya_cancelo");
  if (cancelled.error?.message.includes("motivo")) redirect("/onboarding?error=motivo");
  if (cancelled.error) redirect("/onboarding?error=cancelar");
  redirect("/onboarding");
}
