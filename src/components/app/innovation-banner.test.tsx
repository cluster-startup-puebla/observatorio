import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("banner de innovación abierta", () => {
  it("pregunta y deja unirse solo cuando todavía no lo es", () => {
    const banner = readFileSync("src/components/app/innovation-banner.tsx", "utf8");
    expect(banner).toContain("¿Quieres convertirte en una empresa de innovación abierta?");
    expect(banner).toContain("Unirme");
    expect(banner).toContain("Uniendo…");
    expect(banner).toContain("toast.success");
    expect(banner).toContain("toast.error");
    expect(banner).toContain("FinishConfetti");
    expect(banner).toContain("if (!show && !celebrate) return null");
  });

  it("unirse queda en su propio permiso y no abre la tabla", () => {
    const sql = readFileSync("supabase/migrations/20261120025000_join_open_innovation.sql", "utf8");
    expect(sql).toContain("function public.join_open_innovation(raw_token text)");
    expect(sql).toContain("function public.open_innovation_joined()");
    expect(sql).toContain("accepted_at is not null");
    expect(sql).toContain("grant execute on function public.join_open_innovation(text) to authenticated");
    expect(sql).not.toContain("grant select on table public.innovation_consents");
  });
});
