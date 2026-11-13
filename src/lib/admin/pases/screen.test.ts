import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("pantalla del pase", () => {
  it("deja DetailFrame y conserva el qr en la url", () => {
    const page = readFileSync("src/app/admin/pases/[id]/page.tsx", "utf8");
    const qr = readFileSync("src/app/admin/pases/[id]/qr-tab.tsx", "utf8");
    const llegada = readFileSync("src/app/admin/pases/[id]/llegada-tab.tsx", "utf8");
    expect(page).toContain("export const instant = false");
    expect(page).not.toContain("DetailFrame");
    expect(page).not.toContain("force-dynamic");
    expect(page).toContain("tabQuery(query.tab");
    expect(page).toContain('"qr"');
    expect(qr).toContain("PaseSection");
    expect(llegada).toContain("/api/admin/pases/");
    expect(llegada).toContain("Marcar que llegó");
  });
});
