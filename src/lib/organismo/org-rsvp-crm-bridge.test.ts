import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("org rsvp crm bridge", () => {
  it("al atribuir crea CRM pendiente y al aceptar manda pase RSVP", () => {
    const sql = readFileSync("supabase/migrations/20261123240000_org_rsvp_crm_bridge.sql", "utf8");
    const actions = readFileSync("src/lib/crm-actions.ts", "utf8");
    const deliver = readFileSync("src/lib/organismo/deliver-org-rsvp-pass.ts", "utf8");
    expect(sql).toContain("attribute_rsvp_invite");
    expect(sql).toContain("'cargar'");
    expect(sql).not.toContain("values (contact, 'confirmar', null");
    expect(sql).toContain("already_confirmed");
    expect(actions).toContain("deliverOrgRsvpPass");
    expect(actions).toContain("sessionSlug");
    expect(deliver).toContain("deliverRsvpPass");
  });
});
