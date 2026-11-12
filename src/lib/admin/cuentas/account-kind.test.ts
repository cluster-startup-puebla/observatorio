import { describe, expect, it } from "vitest";
import { accountKind, cuentaStat, cuentaTabList, roleLabel } from "./account-kind";

describe("tipo de cuenta", () => {
  it("separa empresario, equipo del organismo y panel", () => {
    expect(accountKind("empresario")).toBe("empresario");
    expect(accountKind("director")).toBe("organismo");
    expect(accountKind("capturista")).toBe("organismo");
    expect(accountKind("invitador")).toBe("organismo");
    expect(accountKind("superadmin")).toBe("panel");
    expect(accountKind("moderador")).toBe("panel");
    expect(roleLabel("capturista")).toBe("Capturista");
  });

  it("el empresario trae pase, respuestas y correos", () => {
    expect(cuentaTabList("empresario").map((tab) => tab.value)).toEqual(["ficha", "pase", "respuestas", "correos"]);
    expect(cuentaTabList("organismo").map((tab) => tab.value)).toEqual(["ficha"]);
    expect(cuentaTabList("panel").map((tab) => tab.value)).toEqual(["ficha"]);
    expect(cuentaStat("empresario", true)).toEqual({ value: "Sí", label: "Pase" });
    expect(cuentaStat("organismo", false).value).toBe("Equipo");
    expect(cuentaStat("panel", false).value).toBe("Panel");
  });
});