import { signupErrorCode } from "@/lib/organismo/signup-back";

export function confirmEmailRedirect(siteUrl: string | undefined) {
  const site = siteUrl?.trim().replace(/\/$/, "") ?? "";
  if (!/^https?:\/\//.test(site)) return undefined;
  return `${site}/login?aviso=confirmado`;
}

export function verifyEmailPath(input: { email: string; sector?: string; invite?: string; cuenta?: string }) {
  const query = new URLSearchParams({ correo: input.email });
  if (input.sector) query.set("sector", input.sector);
  if (input.invite) query.set("invitacion", input.invite);
  if (input.cuenta) query.set("cuenta", input.cuenta);
  return `/verificar?${query}`;
}

export function unconfirmedSignup(input: { needConfirm: boolean; signInError: string | null; gotSession: boolean }) {
  if (input.gotSession) return "session" as const;
  if (input.needConfirm) return "verificar" as const;
  if (input.signInError && signupErrorCode(input.signInError) === "confirmar") return "verificar" as const;
  return "auth" as const;
}

export function resendConfirmationResult(errorMessage: string | null) {
  if (!errorMessage) return "ok" as const;
  return signupErrorCode(errorMessage) === "limite" ? ("limite" as const) : ("ok" as const);
}
