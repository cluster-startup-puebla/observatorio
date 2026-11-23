import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

it("confirm y claim no crean password y respetan cupo", () => {
  const confirm = readFileSync("supabase/migrations/20261123051000_sync_and_confirm_rsvp.sql", "utf8");
  const claim = readFileSync("supabase/migrations/20261123230000_verify_company_account.sql", "utf8");
  const invite = readFileSync("supabase/migrations/20261123054100_attribute_rsvp_invite.sql", "utf8");
  expect(confirm).toContain("confirm_registration_rsvp");
  expect(confirm).toContain("session_is_full");
  expect(confirm).not.toContain("Observatorio2026");
  expect(confirm).not.toContain("encrypted_password");
  expect(claim).toContain("claim_session_seat");
  expect(claim).toContain("cupo_lleno");
  expect(claim).toContain("is_current");
  expect(claim).not.toContain("no_aceptada");
  expect(invite).toContain("function public.attribute_rsvp_invite");
  expect(invite).toContain("organization_id = clean_org");
  expect(invite).toContain("grant execute on function public.attribute_rsvp_invite(uuid, uuid) to anon");
});
