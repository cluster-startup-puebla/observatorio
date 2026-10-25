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

  it("arma bienvenida, recordatorio y gracias", () => {
    expect(mailFor("welcome", "ana@norte.mx").subject).toBe("Tu lugar en el Observatorio ya está apartado");
    expect(mailFor("reminder", "ana@norte.mx").subject).toBe("Mañana es la sesión del Observatorio");
    expect(mailFor("thanks", "ana@norte.mx").subject).toBe("Gracias por venir a la sesión");
  });

  it("no arma un correo sin destinatario", () => {
    expect(() => mailFor("password", " ")).toThrow("correo inválido");
  });
});
