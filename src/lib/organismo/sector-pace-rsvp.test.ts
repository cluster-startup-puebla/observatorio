import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("sector pace desde RSVPs", () => {
  it("el RPC cuenta confirmados de la sesión vigente", () => {
    const rpc = readFileSync("supabase/migrations/20261123054600_sector_pace_session_rsvps.sql", "utf8");
    const pace = readFileSync("src/lib/organismo/load-sector-pace.ts", "utf8");
    expect(rpc).toContain("session_rsvps");
    expect(rpc).toContain("organization_id = org");
    expect(rpc).toContain("status = 'confirmed'");
    expect(rpc).not.toContain("sector_occupied_ids");
    expect(pace).not.toContain("TODO");
    expect(pace).toContain('rpc("sector_pace"');
  });

  it("persiste rsvp_passes al entregar el correo", () => {
    const table = readFileSync("supabase/migrations/20261123054500_rsvp_passes.sql", "utf8");
    const route = readFileSync("src/app/api/admin/registros/[id]/aceptar/route.ts", "utf8");
    expect(table).toContain("create table public.rsvp_passes");
    expect(table).toContain("record_rsvp_pass");
    expect(route).toContain("deliverRsvpPass");
  });
});