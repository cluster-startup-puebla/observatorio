import { isChallengeArea } from "./areas";
import type { ChallengeUrgency, ChallengeVisibility } from "./status";

export type ChallengeInput = {
  name: string;
  area: string;
  areaNote?: string;
  descriptionHtml: string;
  successMetric: string;
  urgency: ChallengeUrgency | "" | null;
  visibility: ChallengeVisibility;
  showCompany: boolean;
};

export function validateChallengeInput(
  input: ChallengeInput,
): { ok: true } | { ok: false; error: string } {
  const name = input.name.trim();
  if (name.length < 8 || name.length > 80) {
    return { ok: false, error: "El nombre debe tener entre 8 y 80 caracteres." };
  }
  if (!isChallengeArea(input.area)) {
    return { ok: false, error: "Elige un área válida." };
  }
  if (input.area === "otro") {
    const note = (input.areaNote ?? "").trim();
    if (note.length < 4 || note.length > 160) {
      return {
        ok: false,
        error: "Con área «Otro», escribe una nota de 4 a 160 caracteres.",
      };
    }
  }
  const plain = input.descriptionHtml.replace(/<[^>]+>/g, "").replace(/\s+/g, "");
  if (plain.length < 8) {
    return { ok: false, error: "La descripción es demasiado corta." };
  }
  const meta = input.successMetric.trim();
  if (meta.length < 8 || meta.length > 500) {
    return { ok: false, error: "La meta debe tener entre 8 y 500 caracteres." };
  }
  if (input.visibility !== "portal" && input.visibility !== "red") {
    return { ok: false, error: "Visibilidad inválida." };
  }
  if (input.urgency && !["baja", "media", "alta"].includes(input.urgency)) {
    return { ok: false, error: "Urgencia inválida." };
  }
  return { ok: true };
}
