import { describe, expect, it } from "vitest";
import { isLinkAccepted, pendingInviteAction } from "./link-acceptance";

describe("aceptación del enlace", () => {
  it("solo confirmo, registrado y llego cuentan como aceptados", () => {
    expect(isLinkAccepted(null)).toBe(true);
    expect(isLinkAccepted("registrado")).toBe(true);
    expect(isLinkAccepted("confirmo")).toBe(true);
    expect(isLinkAccepted("llego")).toBe(true);
    expect(isLinkAccepted("cargado")).toBe(false);
    expect(isLinkAccepted("contactado")).toBe(false);
    expect(isLinkAccepted("no")).toBe(false);
  });

  it("el enlace pendiente se acepta y el manual se contacta", () => {
    expect(pendingInviteAction({ source: "enlace", status: "cargado" })).toBe("aceptar");
    expect(pendingInviteAction({ source: "manual", status: "cargado" })).toBe("contactar");
    expect(pendingInviteAction({ source: "excel", status: "cargado" })).toBe("contactar");
    expect(pendingInviteAction({ source: "enlace", status: "registrado" })).toBeNull();
  });
});
