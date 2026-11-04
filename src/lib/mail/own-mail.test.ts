import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("correo propio", () => {
  it("solo el empresario encola bienvenida o pase", () => {
    const sql = readFileSync("supabase/migrations/20261103233000_own_mail.sql", "utf8");
    expect(sql).toContain("enqueue_own_mail");
    expect(sql).toContain("record_own_mail");
    expect(sql).toContain("mail_kind not in ('welcome', 'event_pass')");
    expect(sql).toContain("role = 'empresario'");
    expect(sql).toContain("onboarded_at is not null");
    expect(sql).toContain("profile_id = auth.uid()");
    expect(sql).toContain("profile_id uuid");
    expect(sql).toContain("outbox_one_event_pass_per_profile_idx");
    expect(sql).toContain("grant execute on function public.enqueue_own_mail(public.mail_kind) to authenticated");
    expect(sql).toContain("grant execute on function public.record_own_mail(uuid, text, text, text) to authenticated");
  });
});
