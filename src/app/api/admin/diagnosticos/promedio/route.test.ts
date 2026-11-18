import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

it("el promedio no lee las respuestas ni usa service role", () => {
  const source = readFileSync("src/app/api/admin/diagnosticos/promedio/route.ts", "utf8");
  expect(source).toContain('select("instrument_id, score")');
  expect(source).not.toContain("answers");
  expect(source).not.toContain("SERVICE_ROLE");
});
