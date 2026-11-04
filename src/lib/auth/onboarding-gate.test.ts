import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("puerta de metodología", () => {
  it("solo abre con un lugar ocupado y cierra el diagnóstico", () => {
    const gate = readFileSync("src/lib/auth/onboarding-gate.ts", "utf8");
    expect(gate).toContain('redirect("/login")');
    expect(gate).toContain('state.data === "ocupa"');
    expect(gate).toContain('redirect("/onboarding")');
    expect(readFileSync("src/app/metodologia/page.tsx", "utf8")).toContain("redirectUnfinishedEmpresario");
    expect(readFileSync("src/app/metodologia/diagnostico/route.ts", "utf8")).toContain(
      "redirectUnfinishedEmpresario",
    );
  });

  it("si la revisión falla, no suelta a metodología", () => {
    expect(readFileSync("src/lib/auth/awaiting-approval.ts", "utf8")).toContain("return true");
  });
});
