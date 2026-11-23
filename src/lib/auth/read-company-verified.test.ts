import { readFileSync } from "node:fs";
import { expect, it } from "vitest";

it("la lectura y el gate de metodología comparten admitted_at", () => {
  const read = readFileSync("src/lib/auth/read-company-verified.ts", "utf8");
  const page = readFileSync("src/app/metodologia/page.tsx", "utf8");
  const route = readFileSync("src/app/metodologia/diagnostico/route.ts", "utf8");
  const api = readFileSync("src/app/api/metodologia/envio/route.ts", "utf8");
  expect(read).toContain("admitted_at");
  expect(read).toContain("isCompanyVerified");
  expect(page).toContain("readCompanyVerified");
  expect(page).toContain("PendingVerificationAlert");
  expect(route).toContain("readCompanyVerified");
  expect(api).toContain("readCompanyVerified");
});