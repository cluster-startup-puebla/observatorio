import "server-only";

import { redirect } from "next/navigation";
import type { AccountRole } from "@/lib/directory";
import { usesSupabaseAuth } from "@/lib/supabase/auth-session";
import { homeForRole } from "./home";
import { readSessionAccount } from "./session-account";

const organismoRoles: AccountRole[] = ["director", "capturista", "invitador"];
const mesaRoles: AccountRole[] = ["moderador", "superadmin"];

async function requireRoles(allowed: AccountRole[]) {
  if (!usesSupabaseAuth()) return null;
  const account = await readSessionAccount();
  if (!account) redirect("/login");
  if (!allowed.includes(account.role)) redirect(homeForRole(account.role));
  return account;
}

export function requireOrganismo() {
  return requireRoles(organismoRoles);
}

export function requireMesa() {
  return requireRoles(mesaRoles);
}
