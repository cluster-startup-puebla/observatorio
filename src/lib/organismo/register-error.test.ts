import { describe, expect, it } from "vitest";
import { registerError } from "./register-error";

describe("errores de registro", () => {
  it("el correo repetido manda a iniciar sesión", () => {
    expect(registerError("existe")).toBe(
      "Ese correo ya está registrado. Inicia sesión con él.",
    );
  });

  it("la contraseña corta sigue diciendo el mínimo", () => {
    expect(registerError("contrasena")).toBe("Usa al menos 8 caracteres.");
  });

  it("un rechazo desconocido recuerda el mínimo", () => {
    expect(registerError("auth")).toBe(
      "No se pudo crear la cuenta. Revisa el correo y usa al menos 8 caracteres.",
    );
  });
});
