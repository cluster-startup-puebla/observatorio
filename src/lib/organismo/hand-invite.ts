import { parseInviteSheet } from "@/lib/invite-sheet";

export function handInviteRow(input: { nombre: string; empresa: string; correo: string }) {
  const parsed = parseInviteSheet([
    ["nombre", "empresa", "correo"],
    [input.nombre, input.empresa, input.correo],
  ]);
  return parsed.ok[0] ?? null;
}
