import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const table = readFileSync("supabase/migrations/20261123050000_session_rsvps.sql", "utf8");
const backfill = readFileSync("supabase/migrations/20261123050100_session_rsvps_backfill.sql", "utf8");
const capacity = readFileSync("supabase/migrations/20261123050200_session_rsvp_capacity.sql", "utf8");

describe("session_rsvps", () => {
  it("crea tabla con unique sesión+email y estados Luma", () => {
    expect(table).toContain("create table public.session_rsvps");
    expect(table).toContain("unique (session_id, email)");
    expect(table).toContain("'pending', 'confirmed', 'cancelled'");
    expect(table).toContain("profile_id uuid");
    expect(table).toContain("company_id uuid");
  });

  it("backfill desde registros y empresas sin borrar origen", () => {
    expect(backfill).toContain("public.public_registrations");
    expect(backfill).toContain("c.admitted_at is not null");
    expect(backfill).toContain("18-11-26-arranque-puebla-x-puebla");
    expect(backfill).toContain("on conflict (session_id, email)");
    expect(backfill).not.toContain("delete from public.public_registrations");
    expect(backfill).not.toContain("drop table");
  });

  it("cupo por sesión cuenta confirmed y respeta capacity_max sin quotas", () => {
    expect(capacity).toContain("function private.session_confirmed_count");
    expect(capacity).toContain("function private.session_is_full");
    expect(capacity).toContain("r.status = 'confirmed'");
    expect(capacity).toContain("s.capacity_max");
    expect(capacity).toContain("session_sector_quotas");
  });
});
