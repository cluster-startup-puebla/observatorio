const roles = ["superadmin", "moderador", "empresario", "director", "capturista", "invitador"] as const;
type Role = (typeof roles)[number];

export function roleChange(input: { role: string; organizationId: string }) {
  if (!roles.includes(input.role as Role)) return { ok: false as const, reason: "rol inválido" };
  const role = input.role as Role;
  const needsOrg = role === "director" || role === "capturista" || role === "invitador";
  const organizationId = input.organizationId.trim();
  if (needsOrg && !organizationId) return { ok: false as const, reason: "ese rol exige organismo" };
  if (!needsOrg && organizationId) return { ok: false as const, reason: "ese rol no lleva organismo" };
  return { ok: true as const, role, organizationId: needsOrg ? organizationId : null };
}
