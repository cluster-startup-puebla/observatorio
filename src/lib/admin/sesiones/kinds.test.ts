import { describe, expect, it } from "vitest";
import { parseSessionKind, parseSessionModality, sessionShapeFromForm } from "./kinds";

describe("plantilla y tipo de sesión", () => {
  it("acepta modalidad y plantilla", () => {
    expect(parseSessionModality("hibrido")).toBe("hibrido");
    expect(parseSessionKind("evento")).toBe("evento");
    expect(parseSessionModality("zoom")).toBeNull();
  });

  it("arma shape desde el form", () => {
    const form = new FormData();
    form.set("modality", "en_linea");
    form.set("kind", "foro");
    form.set("instrument_id", "automotriz");
    expect(sessionShapeFromForm(form)).toEqual({
      ok: true,
      modality: "en_linea",
      kind: "foro",
      instrument_id: "automotriz",
    });
  });
});
