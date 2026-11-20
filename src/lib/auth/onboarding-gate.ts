import "server-only";

import { redirect } from "next/navigation";
import { createSupabaseWithAccess, readAccessToken, usesSupabaseAuth } from "@/lib/supabase/auth-session";
import { pathAfterSignIn } from "./home";
import { readSessionAccount } from "./session-account";

/** Kept for the commented seat gate below. */
export async function seatOccupied() {
  const token = await readAccessToken();
  if (!token) return false;
  const state = await createSupabaseWithAccess(token).rpc("my_attendance_state");
  return state.data === "ocupa";
}

export async function redirectUnfinishedEmpresario() {
  if (!usesSupabaseAuth()) return;
  const account = await readSessionAccount();
  if (!account) redirect("/login");
  if (account.role !== "empresario") {
    redirect(
      pathAfterSignIn({
        role: account.role,
        onboarded: account.onboarded,
        awaitingApproval: account.awaitingApproval,
      }),
    );
  }
  if (!account.onboarded) redirect("/onboarding");
  // Cuenta libre: aceptación / asiento ya no bloquean el diagnóstico.
  // if (account.awaitingApproval || !(await seatOccupied())) redirect("/onboarding");
}
