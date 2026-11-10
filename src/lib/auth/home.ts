import type { AccountRole } from "@/lib/directory";

const homes: Record<AccountRole, string> = {
  superadmin: "/admin",
  moderador: "/admin/mesa",
  empresario: "/metodologia",
  director: "/organismo",
  capturista: "/organismo",
  invitador: "/organismo",
};

export function isAccountRole(value: string): value is AccountRole {
  return Object.hasOwn(homes, value);
}

const orgRoles = new Set<AccountRole>(["director", "capturista", "invitador"]);

export function homeForRole(role: AccountRole, slug?: string | null) {
  if (orgRoles.has(role) && slug) return `/${slug}`;
  return homes[role];
}

export function pathAfterSignIn(input: {
  role: AccountRole;
  onboarded: boolean;
  awaitingApproval?: boolean;
  eventOpen?: boolean;
  slug?: string | null;
}) {
  if (input.role === "empresario" && (!input.onboarded || input.awaitingApproval)) return "/onboarding";
  if (input.role === "empresario" && input.eventOpen === false) return "/onboarding";
  return homeForRole(input.role, input.slug);
}
