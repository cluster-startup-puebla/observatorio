import { describe, expect, it } from "vitest";
import type { PublicSession } from "@/lib/sessions/load-public";
import { llmsText } from "./llms-text";
import { sitemapEntries } from "./sitemap-entries";

const origin = "https://observatorio.example";

const session: PublicSession = {
  publicSlug: "18-11-26-arranque-puebla-x-puebla",
  title: "Arranque Puebla x Puebla",
  sessionOn: "2026-11-18",
  venue: "Quinta Real, Puebla",
};

describe("índice público", () => {
  it("lista las páginas, la sesión y la nota, y deja fuera el panel", async () => {
    const urls = (await sitemapEntries({ origin, sessions: [session] })).map((entry) => entry.url);
    expect(urls).toContain(`${origin}/`);
    expect(urls).toContain(`${origin}/sesiones/${session.publicSlug}`);
    expect(urls).toContain(`${origin}/blog/arranque-puebla-x-puebla-2026`);
    expect(urls.some((url) => url.includes("/admin"))).toBe(false);
  });

  it("escribe el resumen para modelos con las mismas rutas", () => {
    const text = llmsText({ origin, sessions: [session] });
    expect(text.startsWith("# Observatorio Tecnológico de Puebla")).toBe(true);
    expect(text).toContain(`${origin}/sesiones/${session.publicSlug}`);
    expect(text).toContain("licitación anónima");
    expect(text).toContain(`${origin}/retos`);

  });
});
