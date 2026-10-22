import { describe, expect, it } from "vitest";
import { staffCreateError } from "./staff-create-error";

describe("staffCreateError", () => {
  it("deja pasar validaciones y oculta infra", () => {
    expect(staffCreateError("ese rol exige organismo")).toBe("ese rol exige organismo");
    expect(staffCreateError("duplicate key value")).toBe("Ese correo ya está registrado.");
    expect(staffCreateError("falta la llave")).toBe("No se pudo crear la cuenta. Intenta de nuevo.");
  });
});
