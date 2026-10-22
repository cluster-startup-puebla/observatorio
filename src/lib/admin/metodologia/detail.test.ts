import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { levelFromChoices } from "./level";

describe("detalle de metodología", () => {
  it("calcula Bronce y no guarda el nivel", () => {
    const rows = Array.from({ length: 17 }, (_, index) => ({
      question_id: index + 1,
      option_value: "a",
      rank: null,
    }));
    rows.push({ question_id: 18, option_value: "falta_materiales", rank: 1 });
    const level = levelFromChoices(rows);
    expect(level.category).toBe("Bronce");
    expect(level.totalScore).toBe(23);
    expect(level.stored).toBe(false);
    expect(level).not.toHaveProperty("level_name");
  });

  it("el detalle lee bandas, preguntas, opciones y condiciones", () => {
    const source = readFileSync("src/lib/admin/metodologia/detail.ts", "utf8");
    const route = readFileSync("src/app/api/admin/metodologia/[id]/route.ts", "utf8");
    expect(source).toContain('.from("section_bands")');
    expect(source).toContain('.from("questions")');
    expect(source).toContain('.from("question_options")');
    expect(source).toContain('.from("question_conditions")');
    expect(source).toContain('.from("response_choices")');
    expect(source).not.toContain("level_name");
    expect(route).toContain("await requireSuperadmin()");
  });
});
