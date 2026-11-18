import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

it("la opción elegida usa la marca o el navy, no un hex suelto", () => {
  const choice = readFileSync("src/components/methodology/v2/choice-list.tsx", "utf8");
  expect(choice).toContain("bg-brand");
  expect(choice).toContain("bg-navy");
  expect(choice).not.toMatch(/#[0-9A-Fa-f]{6}/);
  const frame = readFileSync("src/components/methodology/v2/question-frame.tsx", "utf8");
  expect(frame).toContain("text-ink");
  expect(frame).not.toContain("text-muted-foreground");
});
