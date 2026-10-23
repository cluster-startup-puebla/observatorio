import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { isLinkAccepted, passIsPending, pendingInviteAction } from "./link-acceptance";

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

  it("el pase en pantalla espera a que todos los enlaces estén aceptados", () => {
    expect(passIsPending([])).toBe(false);
    expect(passIsPending(["registrado"])).toBe(false);
    expect(passIsPending(["cargado"])).toBe(true);
    expect(passIsPending(["registrado", "cargado"])).toBe(true);
    expect(passIsPending(["no"])).toBe(true);
  });

  it("la migración del enlace solo carga el contacto", () => {
    const sql = readFileSync("supabase/migrations/20261023190000_link_signup_pending.sql", "utf8");
    expect(sql).toContain("create or replace function public.attribute_link_signup");
    expect(sql).toContain("'cargar'");
    expect(sql).not.toContain("'confirmar'");
    expect(sql).not.toContain("'registrar'");
  });

  it("aceptar escribe confirmar y registrar para un enlace pendiente", () => {
    const sql = readFileSync("supabase/migrations/20261023190100_approve_link_signup.sql", "utf8");
    expect(sql).toContain("function public.approve_link_signup(contact_id uuid)");
    expect(sql).toContain("src is distinct from 'enlace'");
    expect(sql).toContain("current_status is distinct from 'cargado'");
    expect(sql).toContain("'confirmar'");
    expect(sql).toContain("'registrar'");
    expect(sql).toContain("grant execute on function public.approve_link_signup(uuid) to authenticated");
  });
});
