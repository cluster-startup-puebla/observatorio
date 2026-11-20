"use server";

import { revalidatePath } from "next/cache";
import { readSessionAccount } from "@/lib/auth/session-account";
import { newConsentToken } from "@/lib/mail/consent-link";
import { createSupabaseWithAccess, readAccessToken } from "@/lib/supabase/auth-session";

const home = "/app/home";

export async function joinOpenInnovation() {
  const account = await readSessionAccount();
  const accessToken = await readAccessToken();
  if (!account || account.role !== "empresario" || !accessToken) return "No se pudo guardar.";
  const db = createSupabaseWithAccess(accessToken);
  const joined = await db.rpc("join_open_innovation", { raw_token: newConsentToken() });
  if (joined.error) return "No se pudo guardar.";
  revalidatePath(home);
  return null;
}
