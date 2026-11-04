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

  it("un token mal formado no llama a la base", async () => {
    const { acceptConsent } = await import("./accept-consent");
    await expect(acceptConsent("corto")).resolves.toBe("invalido");
  });

  it("abrir la página no acepta; el botón sí", () => {
    const page = readFileSync("src/app/innovacion-abierta/aceptar/page.tsx", "utf8");
    const form = readFileSync("src/app/innovacion-abierta/aceptar/accept-form.tsx", "utf8");
    const route = readFileSync("src/app/api/innovacion-abierta/aceptar/route.ts", "utf8");
    expect(page).not.toContain("accept_open_innovation");
    expect(page).not.toContain("acceptConsent");
    expect(form).toContain('method="post"');
    expect(form).toContain('name="token"');
    expect(form).toContain("Sí, pueden contactarme");
    expect(form).not.toContain(".rpc(");
    expect(route).toContain("acceptConsent");
    expect(route).toContain('"/innovacion-abierta/aceptar?listo=1"');
    expect(route).toContain('"/innovacion-abierta/aceptar?error=1"');
  });
});
