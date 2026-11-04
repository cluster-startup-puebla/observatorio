import "server-only";

import { inviteFromMetadata } from "@/lib/auth/invite-carry";
import { createSupabaseAnon, readAccessToken, usesSupabaseAuth } from "@/lib/supabase/auth-session";

export async function inviteToken(formData: FormData) {
  const posted = String(formData.get("invitacion") ?? "").trim();
  if (posted || !usesSupabaseAuth()) return posted;
  const access = await readAccessToken();
  if (!access) return "";
  const user = await createSupabaseAnon().auth.getUser(access);
  return inviteFromMetadata(user.data.user?.user_metadata).invite;
}
