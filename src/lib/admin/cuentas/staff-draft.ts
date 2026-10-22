const staffRoles = ["moderador", "capturista", "invitador"] as const;
type StaffRole = (typeof staffRoles)[number];

export function staffDraft(input: { role: string; organizationId: string }) {
  if (!staffRoles.includes(input.role as StaffRole)) {
    return { ok: false as const, reason: "ese rol no se crea aquí" };
  }
  const role = input.role as StaffRole;
  const organizationId = input.organizationId.trim();
  if (role === "moderador") return { ok: true as const, role, organizationId: null };
  if (!organizationId) return { ok: false as const, reason: "ese rol exige organismo" };
  return { ok: true as const, role, organizationId };
}
