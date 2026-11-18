import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import index from "@/content/methodology/v2/index.json";

it("el banco trae 22 generales y 21 instrumentos de 19", () => {
  expect(index.counts).toEqual({ n1: 22, n2: 399 });
  expect(index.sectorQuestionId).toBe("MOD0-WEB-01");
  expect(index.instruments).toHaveLength(21);
  const n1 = JSON.parse(readFileSync("src/content/methodology/v2/n1.json", "utf8"));
  expect(n1.questions).toHaveLength(22);
});
