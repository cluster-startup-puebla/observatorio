import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { recordArrival } from "./record";

describe("escaneo de la mesa", () => {
  it("escribe la llegada y el hecho llegar cuando el CRM está registrado", () => {
    expect(recordArrival({ hasPass: true, hasArrival: false, crmStatus: "registrado", profileId: "p1", scannedBy: "admin" })).toEqual({
      ok: true,
      arrival: { profile_id: "p1", scanned_by: "admin" },
      crmEvent: "llegar",
    });
    expect(recordArrival({ hasPass: true, hasArrival: true, crmStatus: "llego", profileId: "p1", scannedBy: "admin" })).toEqual({
      ok: false,
      reason: "ya llegó",
    });
    expect(recordArrival({ hasPass: false, hasArrival: false, crmStatus: null, profileId: "p1", scannedBy: "admin" })).toEqual({
      ok: false,
      reason: "sin qr",
    });
  });

  it("el handler inserta arrivals y el hecho llegar", () => {
    const source = readFileSync("src/app/api/admin/mesa/route.ts", "utf8");
    expect(source).toContain("await requireSuperadmin()");
    expect(source).toContain("recordArrival");
    expect(source).toContain('.from("arrivals")');
    expect(source).toContain('.from("crm_events")');
  });
});
