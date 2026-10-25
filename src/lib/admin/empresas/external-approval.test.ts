import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { externalApprovalLabel, waitsForExternalApproval } from "./external-approval";
import { sectorSourceLabel } from "./sector-source";

describe("registro externo", () => {
  it("path se lee como lugar desconocido", () => {
    expect(sectorSourceLabel("path")).toBe("Lugar desconocido");
    expect(sectorSourceLabel("link")).toBe("Por el enlace del organismo");
    expect(sectorSourceLabel("chosen")).toBe("Lo eligió la persona");
  });

  it("solo path sin fecha de aceptación espera al superadmin", () => {
    expect(waitsForExternalApproval("path", null)).toBe(true);
    expect(waitsForExternalApproval("path", "2026-10-24T00:00:00Z")).toBe(false);
    expect(waitsForExternalApproval("link", null)).toBe(false);
    expect(waitsForExternalApproval("chosen", null)).toBe(false);
  });

  it("la ficha distingue pendiente, aceptada y lo que no aplica", () => {
    expect(externalApprovalLabel("path", null)).toBe("Pendiente");
    expect(externalApprovalLabel("path", "2026-10-24T00:00:00Z")).toBe("Aceptada");
    expect(externalApprovalLabel("link", null)).toBe("No aplica");
  });

  it("las columnas dejan aceptadas a las empresas path que ya existen", () => {
    const sql = readFileSync("supabase/migrations/20261024230000_external_signup_columns.sql", "utf8");
    expect(sql).toContain("add column admitted_at timestamptz");
    expect(sql).toContain("add column admitted_by uuid references public.profiles (id) on delete set null");
    expect(sql).toContain("where sector_source = 'path'");
    expect(sql).toContain("admitted_at = clock_timestamp()");
  });

  it("aceptar un externo solo lo puede el superadmin y deja fecha y autor", () => {
    const sql = readFileSync("supabase/migrations/20261024230100_approve_external_signup.sql", "utf8");
    expect(sql).toContain("function public.approve_external_signup(company_id uuid)");
    expect(sql).toContain("private.is_superadmin()");
    expect(sql).toContain("src is distinct from 'path'");
    expect(sql).toContain("already is not null");
    expect(sql).toContain("admitted_by = auth.uid()");
    expect(sql).not.toContain("crm_events");
    expect(sql).toContain("grant execute on function public.approve_external_signup(uuid) to authenticated");
    expect(sql).toContain("revoke update (admitted_at, admitted_by) on public.companies from authenticated, anon");
  });

  it("el onboarding consulta la empresa del empresario", () => {
    const screen = readFileSync("src/app/onboarding/supabase-screen.tsx", "utf8");
    const state = readFileSync("src/lib/onboarding/external-pass-state.ts", "utf8");
    expect(state).toContain("waitsForExternalApproval");
    expect(state).toContain('.from("companies")');
    expect(screen).toContain("externalPassPending");
    expect(screen).toContain("pendingLink || pendingExternal");
  });

  it("asistentes y logos leen la aceptación externa", () => {
    const attending = readFileSync("src/lib/admin/empresas/load-attending.ts", "utf8");
    const logos = readFileSync("src/lib/admin/empresas/load-event-logos.ts", "utf8");
    expect(attending).toContain("waitsForExternalApproval");
    expect(attending).toContain("admitted_at");
    expect(logos).toContain("waitsForExternalApproval");
    expect(logos).toContain("admitted_at");
  });
});
