import "server-only";

import { redirect } from "next/navigation";
import { usesSupabaseAuth } from "@/lib/supabase/auth-session";
import { readSessionAccount } from "./session-account";

export async function redirectUnfinishedEmpresario() {
  if (!usesSupabaseAuth()) return;
  const account = await readSessionAccount();
  if (!account || account.role !== "empresario" || account.onboarded) return;
  redirect("/onboarding");
}
