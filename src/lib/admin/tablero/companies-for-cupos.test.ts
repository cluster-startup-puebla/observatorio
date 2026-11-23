import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("companies for cupos", () => {
  it("incluye empresas ligadas por RSVP aunque session_id sea null", () => {
    const source = readFileSync("src/lib/admin/tablero/companies-for-cupos.ts", "utf8");
    const data = readFileSync("src/lib/admin/tablero/cupos-session-data.ts", "utf8");
    expect(source).toContain("rsvpCompanyIds");
    expect(source).toContain(".in(\"id\", ids)");
    expect(data).toContain("companiesForCupos");
    expect(data).toContain("company_id");
  });
});
