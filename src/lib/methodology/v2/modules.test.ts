import { expect, it } from "vitest";
import { moduleOf, modulePlace } from "./modules";
import type { V2Question } from "./types";

it("el módulo usa el nombre corto y el avance es dentro del módulo", () => {
  expect(moduleOf("MÓDULO 0: ENRUTAMIENTO", "n1").label).toBe("Módulo 0. Perfil");
  expect(moduleOf("SECCIÓN II: AUDITORÍA", "n1").label).toBe("Módulo 2. Innovación");
  expect(moduleOf("SECCIÓN II: AUDITORÍA", "n2").label).toBe("Módulo 2. Auditoría");
  const questions = [
    question("a", "n1", "SECCIÓN I: ENTORNO"),
    question("b", "n1", "SECCIÓN I: ENTORNO"),
    question("c", "n2", "SECCIÓN I: ROMPEHIELOS"),
  ] as V2Question[];
  expect(modulePlace(questions, 1)).toEqual({ label: "Módulo 1. Entorno", meta: "2/2", progress: 100 });
  expect(modulePlace(questions, 2).progress).toBe(100);
});

function question(id: string, level: "n1" | "n2", section: string) {
  return { id, level, section, type: "single_select", title: id, prompt: id, options: [] };
}
