import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

it("hace un upsert con applyRun y no calcula la nota en el servidor", () => {
  const source = readFileSync("src/app/api/metodologia/envio/route.ts", "utf8");
  expect(source).not.toContain("SERVICE_ROLE");
  expect(source).not.toContain("scoreLive");
  expect(source).toContain("applyRun");
  expect(source).toContain("saveRun");
  expect(source).toContain("createSupabaseWithAccess");
  expect(source).toContain("readAccessToken");
  expect(source).toContain("usesSupabaseAuth");
  expect(source).not.toContain('DIRECTORY === "memory"');
  expect(source).toContain("methodology_v2_runs");
  expect(source).not.toContain("profile_id: body");
});
