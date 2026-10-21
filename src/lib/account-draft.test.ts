import { describe, expect, it } from "vitest";
import { accountErrors } from "./account-draft";

describe("accountErrors", () => {
  it("acepta un correo y una contraseña de ocho caracteres", () => {
    expect(accountErrors({ email: "ana@norte.mx", password: "secreto-largo" })).toBeNull();
  });

  it("rechaza correo vacío, correo sin dominio y contraseña corta", () => {
    expect(accountErrors({ email: "", password: "" })).toEqual({
      email: "Escribe un correo válido.",
      password: "Usa al menos 8 caracteres.",
    });
    expect(accountErrors({ email: "ana", password: "1234567" })?.email).toBe("Escribe un correo válido.");
    expect(accountErrors({ email: "ana@norte.mx", password: "   corta " })?.password).toBe(
      "Usa al menos 8 caracteres.",
    );
  });
});
