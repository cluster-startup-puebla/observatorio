import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

it("el resultado se calcula en el teléfono y se puede reintentar el envío", () => {
  const names = ["result.tsx", "score-bars.tsx", "pentagon.tsx", "steps.tsx"];
  const source = names.map((name) => readFileSync(`src/components/methodology/v2/${name}`, "utf8")).join("\n");
  expect(source).toContain("scoreLive");
  expect(source).toContain("buildReport");
  expect(source).toContain("Reintentar envío");
  expect(source).not.toContain("confetti");
  expect(source).not.toContain("V2_EXAMPLES");
  expect(source).not.toContain("Volver a empezar");
});
