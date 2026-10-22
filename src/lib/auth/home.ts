import type { AccountRole } from "@/lib/directory";

const homes: Record<AccountRole, string> = {
  superadmin: "/admin",
  moderador: "/mesa",
  empresario: "/metodologia",
  director: "/organismo",
  capturista: "/organismo",
  invitador: "/organismo",
};

export function isAccountRole(value: string): value is AccountRole {
  return Object.hasOwn(homes, value);
}

export function homeForRole(role: AccountRole) {
  return homes[role];
}
