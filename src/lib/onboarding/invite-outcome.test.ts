import { describe, expect, it } from "vitest";
import { inviteOutcome } from "./invite-outcome";

describe("pase según la invitación", () => {
  it("espera si falta la aceptación", () => {
    expect(inviteOutcome([])).toBe("espera");
    expect(inviteOutcome(["cargado"])).toBe("espera");
    expect(inviteOutcome(["contactado"])).toBe("espera");
    expect(inviteOutcome(["registrado", "cargado"])).toBe("espera");
  });

  it("no muestra el pase si lo rechazaron", () => {
    expect(inviteOutcome(["no"])).toBe("cerrado");
    expect(inviteOutcome(["no", "no"])).toBe("cerrado");
  });

  it("muestra el pase solo cuando ya está aceptado", () => {
    expect(inviteOutcome(["registrado"])).toBe("pase");
    expect(inviteOutcome(["confirmo"])).toBe("pase");
    expect(inviteOutcome(["llego"])).toBe("pase");
  });
});
