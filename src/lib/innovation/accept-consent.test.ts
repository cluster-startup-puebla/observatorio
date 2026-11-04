import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("permiso de innovación abierta", () => {
  it("solo el superadmin lee la tabla y el anon solo puede aceptar", () => {
    const sql = readFileSync("supabase/migrations/20261103235000_innovation_consent.sql", "utf8");
    expect(sql).toContain("create table public.innovation_consents");
    expect(sql).toContain("token text not null unique");
    expect(sql).toContain("accepted_at timestamptz");
    expect(sql).toContain("private.is_superadmin()");
    expect(sql).toContain("grant execute on function public.accept_open_innovation(text) to anon, authenticated");
    expect(sql).toContain("revoke all on table public.innovation_consents from anon");
    expect(sql).not.toContain("grant select on table public.innovation_consents to anon");
    expect(sql).toContain("return 'invalido'");
    expect(sql).toContain("return 'aceptado'");
  });
});
