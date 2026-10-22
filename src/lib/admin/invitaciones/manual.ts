import { parseInviteSheet } from "@/lib/invite-sheet";

export function manualInvite(input: { nombre: string; empresa: string; correo: string; organizationId: string }) {
  const parsed = parseInviteSheet([
    ["nombre", "empresa", "correo"],
    [input.nombre, input.empresa, input.correo],
  ]);
  const row = parsed.ok[0];
  if (!input.organizationId || !row || parsed.errors.length) {
    return { ok: false as const, reason: parsed.errors[0]?.reason ?? "fila inválida" };
  }
  return {
    ok: true as const,
    contact: {
      organization_id: input.organizationId,
      nombre: row.nombre,
      empresa: row.empresa,
      email: row.correo,
      source: "manual" as const,
      event: "cargar" as const,
    },
  };
}
