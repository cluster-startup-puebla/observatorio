import { describe, expect, it } from "vitest";
import { emptyEmpresarioValues } from "@/lib/onboarding/empresario-steps";
import { readEmpresarioDraft, writeEmpresarioDraft } from "./empresario-draft-storage";

describe("borrador del perfil", () => {
  it("recupera el texto y no finge que hay logo", () => {
    const memory = new Map<string, string>();
    const storage = {
      getItem: (key: string) => memory.get(key) ?? null,
      setItem: (key: string, value: string) => memory.set(key, value),
    };
    const values = {
      ...emptyEmpresarioValues("turismo"),
      fullName: "Marina Solís",
      sessionInterest: "Quiero proveedores locales",
      hasLogo: true,
    };
    writeEmpresarioDraft(storage, "cuenta-1", values);
    expect(readEmpresarioDraft(storage, "cuenta-1", "turismo")).toMatchObject({
      fullName: "Marina Solís",
      sessionInterest: "Quiero proveedores locales",
      hasLogo: false,
    });
  });
});
