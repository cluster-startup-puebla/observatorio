import type { AccountRole } from "@/lib/directory";
import { pathAfterSignIn } from "./home";

type GateAccount = { role: AccountRole; onboarded: boolean };

const sessionEntries = new Set<string>([
  "/",
  "/login",
  "/register",
  "/verificar",
  "/recuperar",
  "/restablecer",
]);

export function sessionRedirect(input: { path: string; account: GateAccount | null }) {
  if (!input.account || !sessionEntries.has(input.path)) return null;
  return pathAfterSignIn({ role: input.account.role, onboarded: input.account.onboarded });
}
