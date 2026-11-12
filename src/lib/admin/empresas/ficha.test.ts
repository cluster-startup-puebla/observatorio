import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { answerLines } from "./answer-lines";

describe("ficha de empresa", () => {
  it("prefiere la etiqueta de la opción sobre el valor crudo", () => {
    const lines = answerLines(
      [{ question_id: "q1", option_value: "a", rank: 1 }],
      [{ id: "q1", prompt: "Reto principal" }],
      [{ question_id: "q1", value: "a", label: "Crecer" }],
    );
    expect(lines[0]).toMatchObject({ prompt: "Reto principal", label: "Crecer" });
    expect(lines[0].label).not.toBe("a");
  });

  it("la tarjeta usa card, avatar, badge y el enlace al sector", () => {
    const header = readFileSync("src/app/admin/empresas/[id]/header-card.tsx", "utf8");
    expect(header).toContain("Card");
    expect(header).toContain("Avatar");
    expect(header).toContain("Badge");
    expect(header).toContain("Link");
    expect(header).toContain("/admin/sectores/");
  });

  it("las pestañas son la variante line y cada panel es una sección", () => {
    const tabs = readFileSync("src/app/admin/empresas/[id]/empresa-tabs.tsx", "utf8");
    expect(tabs).toContain('variant="line"');
    expect(tabs).toContain("TabsList");
    expect(tabs).toContain("TabsTrigger");
    expect(tabs).toContain("data-testid={`tab-${value}`}");
    for (const file of ["sector-section", "tamano-section", "respuestas-section", "pase-section"]) {
      expect(tabs).toContain(`./${file}`);
      expect(readFileSync(`src/app/admin/empresas/[id]/${file}.tsx`, "utf8").length).toBeGreaterThan(20);
    }
  });
});
