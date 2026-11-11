import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("asunto de la cuenta creada", () => {
  const sql = readFileSync("supabase/migrations/20261110200000_welcome_account_subject.sql", "utf8");

  it("reemplaza el asunto de la bienvenida y deja el pase igual", () => {
    expect(sql).toContain("create or replace function public.enqueue_own_mail(mail_kind public.mail_kind)");
    expect(sql).toContain("Tu cuenta en el Observatorio ya fue creada");
    expect(sql).toContain("Tu pase para la sesión ya está listo");
    expect(sql).not.toContain("Tu lugar en el Observatorio ya está apartado");
  });

  it("terminar el perfil sigue dejando la invitación en espera", () => {
    const signup = readFileSync("supabase/migrations/20261023190000_link_signup_pending.sql", "utf8");
    const issue = readFileSync("src/lib/onboarding/issue-confirmed-pass.ts", "utf8");
    expect(signup).toContain("'cargar'");
    expect(issue.indexOf("if (pendingLink || pendingExternal) return")).toBeLessThan(issue.indexOf("await storePass"));
  });
});
