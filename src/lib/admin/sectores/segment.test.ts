import { describe, expect, it } from "vitest";
import { adminSegment } from "./segment";

const modules = ["empresas", "sectores"];

describe("segmento del admin", () => {
  it("un módulo gana aunque también exista un sector", () => {
    expect(adminSegment("empresas", modules, true)).toBe("module");
  });

  it("un slug de sector abre su lista", () => {
    expect(adminSegment("educacion", modules, true)).toBe("sector");
  });

  it("un slug desconocido no abre nada", () => {
    expect(adminSegment("no-existe", modules, false)).toBe("missing");
  });
});
