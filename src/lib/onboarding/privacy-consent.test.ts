import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("consentimiento y logo", () => {
  it("guarda el aviso y el uso de datos, no un texto libre", () => {
    const sql = readFileSync("supabase/migrations/20261104233500_privacy_consents.sql", "utf8");
    expect(sql).toContain("create table public.privacy_consents");
    expect(sql).toContain("'aviso-de-privacidad', '2026-10-15'");
    expect(sql).toContain("'uso-de-datos', '2026-10-15'");
    expect(sql).toContain("grant select on table public.privacy_consents to authenticated");
    expect(sql).not.toContain("grant insert");
  });

  it("el perfil guarda si el logo se muestra el día del evento", () => {
    const save = readFileSync("src/lib/onboarding/save-empresario.ts", "utf8");
    expect(save).toContain("show_logo_on_event: showLogo");
    expect(save).toContain('rpc("record_privacy_consent")');
  });
});
