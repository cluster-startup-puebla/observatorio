import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("puerta de metodología", () => {
  it("abre con onboarding terminado; la regla de asiento queda comentada", () => {
    const gate = readFileSync("src/lib/auth/onboarding-gate.ts", "utf8");
    expect(gate).toContain('redirect("/login")');
    expect(gate).toContain('if (!account.onboarded) redirect("/onboarding")');
    expect(gate).toContain("my_attendance_state");
    expect(gate).toContain('state.data === "ocupa"');
    expect(gate).toContain(
      "// if (account.awaitingApproval || !(await seatOccupied())) redirect(\"/onboarding\");",
    );
    expect(readFileSync("src/app/metodologia/page.tsx", "utf8")).toContain("redirectUnfinishedEmpresario");
    expect(readFileSync("src/app/metodologia/diagnostico/route.ts", "utf8")).toContain(
      "redirectUnfinishedEmpresario",
    );
  });
});
