import { describe, expect, it } from "vitest";
import { applyCrmEvent, type CrmEvent, type CrmStatus } from "./crm-status";

describe("applyCrmEvent", () => {
  it("una carga abre en cargado", () => {
    expect(applyCrmEvent(null, "cargar")).toEqual({ ok: true, status: "cargado" });
  });

  it("avanza por los hechos y llegar exige registrado", () => {
    const confirmed = applyCrmEvent("cargado", "confirmar");
    const registered = applyCrmEvent("confirmo", "registrar");
    const arrived = applyCrmEvent("registrado", "llegar");
    expect(confirmed).toEqual({ ok: true, status: "confirmo" });
    expect(registered).toEqual({ ok: true, status: "registrado" });
    expect(arrived).toEqual({ ok: true, status: "llego" });
    expect(applyCrmEvent("cargado", "llegar")).toEqual({
      ok: false,
      status: "cargado",
      reason: "transición inválida",
    });
  });

  it("contactar es opcional y no se puede después de confirmar", () => {
    expect(applyCrmEvent("cargado", "contactar")).toEqual({
      ok: true,
      status: "contactado",
    });
    expect(applyCrmEvent("confirmo", "contactar").ok).toBe(false);
  });

  it("rechazar apaga el recorrido y llegar no se revierte", () => {
    expect(applyCrmEvent("registrado", "rechazar")).toEqual({ ok: true, status: "no" });
    expect(applyCrmEvent("llego", "rechazar")).toEqual({
      ok: false,
      status: "llego",
      reason: "transición inválida",
    });
    expect(applyCrmEvent("no", "confirmar").ok).toBe(false);
  });

  it("no se puede cargar dos veces ni actuar sin estatus", () => {
    expect(applyCrmEvent("cargado", "cargar")).toEqual({
      ok: false,
      status: "cargado",
      reason: "transición inválida",
    });
    expect(applyCrmEvent(null, "contactar")).toEqual({
      ok: false,
      status: null,
      reason: "transición inválida",
    });
    expect(applyCrmEvent(null, "llegar").ok).toBe(false);
  });

  it("rechazar cierra desde cualquier estatus abierto y llego queda quieto", () => {
    const open: CrmStatus[] = ["cargado", "contactado", "confirmo", "registrado"];
    for (const status of open) {
      expect(applyCrmEvent(status, "rechazar")).toEqual({ ok: true, status: "no" });
    }
    const stuck: CrmEvent[] = ["cargar", "contactar", "confirmar", "registrar", "llegar", "rechazar"];
    for (const event of stuck) {
      expect(applyCrmEvent("llego", event).ok).toBe(false);
      expect(applyCrmEvent("no", event).ok).toBe(false);
    }
  });

  it("el atajo de contactado no salta el registro", () => {
    expect(applyCrmEvent("contactado", "registrar").ok).toBe(false);
    expect(applyCrmEvent("contactado", "llegar").ok).toBe(false);
    expect(applyCrmEvent("contactado", "confirmar")).toEqual({ ok: true, status: "confirmo" });
  });
});
