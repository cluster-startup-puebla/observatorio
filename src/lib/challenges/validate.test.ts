import { describe, expect, it } from "vitest";
import { validateChallengeInput } from "./validate";

describe("validateChallengeInput", () => {
  const base = {
    name: "Sistema de trazabilidad",
    area: "produccion" as const,
    descriptionHtml: "<p>Necesitamos lotes rastreados.</p>",
    successMetric: "Reducir mermas en 20% en 6 meses.",
    urgency: "media" as const,
    visibility: "portal" as const,
    showCompany: true,
  };

  it("accepts a valid payload", () => {
    expect(validateChallengeInput(base)).toEqual({ ok: true });
  });

  it("rejects short name and empty html", () => {
    expect(validateChallengeInput({ ...base, name: "Corto" }).ok).toBe(false);
    expect(validateChallengeInput({ ...base, descriptionHtml: "<p></p>" }).ok).toBe(false);
  });
});
