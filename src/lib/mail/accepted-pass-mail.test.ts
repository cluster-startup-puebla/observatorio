import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("pase al aceptar", () => {
  const sql = readFileSync("supabase/migrations/20261109143000_accepted_pass_mail.sql", "utf8");

  it("encola el pase del invitado, no el del director", () => {
    expect(sql).toContain("function public.enqueue_accepted_pass(contact_id uuid)");
    expect(sql).toContain("src is distinct from 'enlace'");
    expect(sql).toContain("current_status is null or current_status not in ('confirmo', 'registrado', 'llego')");
    expect(sql).toContain("organization_id = (select private.current_organization_id())");
    expect(sql).toContain("profiles.onboarded_at is not null");
    expect(sql).toContain("'event_pass'");
    expect(sql).toContain("already_sent");
    expect(sql).toContain("grant execute on function public.enqueue_accepted_pass(uuid) to authenticated");
  });

  it("registra el envío sin exigir que la sesión sea la del invitado", () => {
    expect(sql).toContain("function public.record_accepted_pass(message_id uuid, provider text, failure text, html text)");
    expect(sql).toContain("kind = 'event_pass'");
    expect(sql).toContain("sent_at is null");
    expect(sql).toContain("grant execute on function public.record_accepted_pass(uuid, text, text, text) to authenticated");
  });
});
