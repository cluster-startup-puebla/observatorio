import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { innovationRecipients } from "./audience";

describe("correo masivo", () => {
  it("solo encola a quien terminó el perfil", () => {
    const rows = innovationRecipients([
      { email: "ana@norte.mx", onboarded_at: "2026-10-21T00:00:00Z" },
      { email: "beto@sur.mx", onboarded_at: null },
      { email: null, onboarded_at: "2026-10-21T00:00:00Z" },
    ]);
    expect(rows).toEqual([
      {
        kind: "open_innovation",
        to_email: "ana@norte.mx",
        subject: "¿Quieres ser una empresa de innovación abierta?",
      },
    ]);
  });

  it("la página conserva el botón del e2e y el route exige superadmin", () => {
    const page = readFileSync("src/app/admin/correo/page.tsx", "utf8");
    const route = readFileSync("src/app/api/admin/correo/route.ts", "utf8");
    expect(page).toContain("Enviar innovación abierta");
    expect(page).toContain('data-testid="encolados"');
    expect(page).toContain("sendInnovationAction");
    expect(page).not.toContain("requireSuperadmin");
    expect(route).toContain("await requireSuperadmin()");
    expect(route).toContain("innovationRecipients");
  });
});
