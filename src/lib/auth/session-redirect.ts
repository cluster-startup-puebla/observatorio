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

function destination(account: GateAccount) {
  return pathAfterSignIn({ role: account.role, onboarded: account.onboarded });
}

export function sessionRedirect(input: { path: string; account: GateAccount | null }) {
  if (!input.account || !sessionEntries.has(input.path)) return null;
  return destination(input.account);
}

export function adminLoginRedirect(input: { open: boolean; account: GateAccount | null }) {
  if (input.open) return "/admin/signup";
  if (!input.account) return null;
  return destination(input.account);
}

export function adminSignupRedirect(input: { open: boolean; account: GateAccount | null }) {
  if (input.open) return null;
  if (input.account) return destination(input.account);
  return "/admin/login";
}
