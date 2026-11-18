import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

it("una fila por persona, el dueño escribe la suya y el superadmin solo lee", () => {
  const sql = readFileSync("supabase/migrations/20261117120000_methodology_v2_runs.sql", "utf8");
  expect(sql).toContain("profile_id uuid primary key");
  expect(sql).toContain("answers jsonb");
  expect(sql).toContain("finished_at timestamptz");
  expect(sql).toContain("profile_id = auth.uid()");
  expect(sql).toContain("private.is_superadmin()");
  expect(sql).not.toContain("question_id text not null");
});
