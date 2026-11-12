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

  it("la tarjeta usa card, un logo rectangular y el enlace al sector", () => {
    const header = readFileSync("src/app/admin/empresas/[id]/header-card.tsx", "utf8");
    const mark = readFileSync("src/app/admin/empresas/[id]/company-mark.tsx", "utf8");
    const pills = readFileSync("src/app/admin/empresas/[id]/approval-pills.tsx", "utf8");
    expect(header).toContain("Card");
    expect(header).toContain("CompanyMark");
    expect(mark).toContain("object-contain");
    expect(header).toContain("/admin/sectores/");
    expect(pills).toContain("Aprobación:");
    expect(pills).toContain("org.href");
  });

  it("las pestañas son la variante line y cada panel es una sección", () => {
    const tabs = readFileSync("src/app/admin/empresas/[id]/empresa-tabs.tsx", "utf8");
    expect(tabs).toContain('variant="line"');
    expect(tabs).toContain("TabsList");
    expect(tabs).toContain("TabsTrigger");
    expect(tabs).toContain("data-testid={`tab-${value}`}");
    expect(readFileSync("src/app/admin/empresas/[id]/pase-section.tsx", "utf8")).toContain("/api/admin/medios/");
    for (const file of ["sector-section", "tamano-section", "miembros-section", "respuestas-section", "pase-section"]) {
      expect(tabs).toContain(`./${file}`);
      expect(readFileSync(`src/app/admin/empresas/[id]/${file}.tsx`, "utf8").length).toBeGreaterThan(20);
    }
  });
});
