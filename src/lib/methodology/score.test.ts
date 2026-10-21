import { describe, expect, it } from "vitest";
import { SECTIONS } from "./instrument";
import { calculateIntegralResult } from "./score";

function priority(top: string) {
  const ranks: Record<string, number> = {
    falta_materiales: 4,
    fallas_mecanicas: 3,
    personal: 2,
    set_ups_lentos: 4,
  };
  ranks[top] = 1;
  return ranks;
}

function answersFor(single: "a" | "b" | "c" | "d", top: string) {
  const answers: Record<number, string | Record<string, number>> = {};
  for (const section of SECTIONS) {
    for (const question of section.questions) {
      answers[question.id] = question.type === "priority" ? priority(top) : single;
    }
  }
  return answers;
}

describe("calculateIntegralResult", () => {
  it("carga las cuatro secciones del ejercicio anterior", () => {
    expect(SECTIONS.map((section) => section.id)).toEqual([
      "infraestructura",
      "equipo_productivo",
      "financiera",
      "operacion",
    ]);
    expect(SECTIONS.reduce((total, section) => total + section.questions.length, 0)).toBe(18);
  });

  it("el máximo es Oro con 108 puntos", () => {
    const result = calculateIntegralResult(answersFor("d", "falta_materiales"));
    expect(result.totalScore).toBe(108);
    expect(result.category).toBe("Oro");
    expect(result.sections.every((section) => section.category === "Oro")).toBe(true);
  });

  it("el piso de 18 puntos es Bronce", () => {
    const result = calculateIntegralResult(answersFor("a", "set_ups_lentos"));
    expect(result.totalScore).toBe(18);
    expect(result.category).toBe("Bronce");
    expect(result.riesgo.length).toBeGreaterThan(0);
    expect(result.reto.length).toBeGreaterThan(0);
  });

  it("el punto medio de cada respuesta cae en Plata", () => {
    const result = calculateIntegralResult(answersFor("c", "fallas_mecanicas"));
    expect(result.totalScore).toBe(17 * 4 + 4);
    expect(result.category).toBe("Plata");
  });

  it("una hoja vacía o una letra inválida no inventan nivel", () => {
    expect(calculateIntegralResult({}).category).toBe("Sin categoría");
    expect(calculateIntegralResult({}).totalScore).toBe(0);
    const broken = answersFor("a", "set_ups_lentos");
    broken[1] = "z";
    expect(calculateIntegralResult(broken).totalScore).toBe(17);
    expect(calculateIntegralResult(broken).category).toBe("Sin categoría");
  });

  it("la prioridad solo suma la severidad de quien quedó en el rango 1", () => {
    const severe = calculateIntegralResult(answersFor("a", "falta_materiales"));
    const mild = calculateIntegralResult(answersFor("a", "set_ups_lentos"));
    expect(severe.totalScore - mild.totalScore).toBe(5);
    const unordered = answersFor("a", "falta_materiales");
    unordered[18] = { personal: 2, fallas_mecanicas: 3 };
    expect(calculateIntegralResult(unordered).totalScore).toBe(17);
  });
});
