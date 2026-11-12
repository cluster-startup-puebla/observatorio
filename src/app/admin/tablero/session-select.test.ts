import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("control de sesión del tablero", () => {
  const source = readFileSync("src/app/admin/tablero/session-select.tsx", "utf8");

  it("el select y los dos botones solo salen con dos sesiones o más", () => {
    expect(source).toContain("choices.length < 2");
    expect(source).toContain("Ver convocatoria");
    expect(source).toContain("Ver detalle");
    expect(source).toContain("/admin/sesiones/");
    expect(source).toContain("pr-10");
  });
});