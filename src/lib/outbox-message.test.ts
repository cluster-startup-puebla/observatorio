import { describe, expect, it } from "vitest";
import { mailFor } from "./outbox-message";

describe("mailFor", () => {
  it("arma los tres correos de la planeación", () => {
    expect(mailFor("password", "ana@norte.mx").subject).toBe("Crea tu contraseña para la sesión");
    expect(mailFor("event_pass", "ana@norte.mx").subject).toBe("Tu pase para la sesión ya está listo");
    expect(mailFor("open_innovation", "ana@norte.mx").subject).toBe(
      "¿Quieres ser una empresa de innovación abierta?",
    );
  });

  it("no arma un correo sin destinatario", () => {
    expect(() => mailFor("password", " ")).toThrow("correo inválido");
  });
});
