import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const sql = readFileSync("supabase/migrations/20261027170000_sector_seat_count.sql", "utf8");

describe("conteo del cupo", () => {
  it("guarda la cancelación y no la cuenta como lugar", () => {
    expect(sql).toContain("create table public.attendance_cancellations");
    expect(sql).toContain("company_id uuid primary key");
    expect(sql).toContain("reason text not null");
    expect(sql).toContain("check (char_length(reason) between 1 and 280)");
    expect(sql).toContain("not exists");
    expect(sql).toContain("public.attendance_cancellations");
  });

  it("cuenta enlace aceptado y alta externa, y bloquea la fila de cupo", () => {
    expect(sql).toContain("function private.sector_is_full(p_sector_id uuid)");
    expect(sql).toContain("for update of q");
    expect(sql).toContain("s.is_current");
    expect(sql).toContain("k.source = 'enlace'");
    expect(sql).toContain("'confirmo', 'registrado', 'llego'");
    expect(sql).toContain("c.sector_source = 'path'");
    expect(sql).toContain("c.admitted_at is not null");
    expect(sql).toContain("p.onboarded_at is not null");
    expect(sql).toContain("p.role = 'empresario'");
  });

  it("las dos aceptaciones lanzan sector_lleno", () => {
    const gate = readFileSync("supabase/migrations/20261027170100_accept_respects_sector_quota.sql", "utf8");
    expect(gate).toContain("function public.approve_link_signup(contact_id uuid)");
    expect(gate).toContain("function public.approve_external_signup(company_id uuid)");
    expect(gate.match(/raise exception 'sector_lleno'/g)).toHaveLength(2);
    expect(gate).toContain("private.sector_is_full");
    expect(gate).toContain("'confirmar'");
    expect(gate).toContain("'registrar'");
    expect(gate).toContain("admitted_at = clock_timestamp()");
  });
});
