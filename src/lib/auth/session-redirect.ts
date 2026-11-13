import type { AccountRole } from "@/lib/directory";
import { pathAfterSignIn } from "./home";

type GateAccount = {
  role: AccountRole;
  onboarded: boolean;
  awaitingApproval?: boolean;
  eventOpen?: boolean;
};

const sessionEntries = new Set<string>([
  "/",
  "/login",
  "/register",
  "/crear-cuenta",
  "/registro",
  "/verificar",
  "/recuperar",
  "/restablecer",
]);

function destination(account: GateAccount) {
  return pathAfterSignIn({
    role: account.role,
    onboarded: account.onboarded,
    awaitingApproval: account.awaitingApproval,
    eventOpen: account.eventOpen,
  });
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
