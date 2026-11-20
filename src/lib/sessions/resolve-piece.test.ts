import { describe, expect, it } from "vitest";
import { pieceKind } from "./resolve-piece";

describe("segmento de la sesión", () => {
  it("un organismo gana sobre un sector con el mismo texto", () => {
    expect(pieceKind({ owner: true, sector: true })).toBe("organismo");
  });

  it("sin organismo y con sector es la landing de sector", () => {
    expect(pieceKind({ owner: false, sector: true })).toBe("sector");
  });

  it("si no es ninguno, no hay página", () => {
    expect(pieceKind({ owner: false, sector: false })).toBe("ninguno");
  });
});
