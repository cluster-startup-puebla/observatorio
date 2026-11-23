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

  it("el handler usa mesa_prepare_arrival e inserta arrivals", () => {
    const process = readFileSync("src/lib/admin/mesa/process-scan.ts", "utf8");
    const route = readFileSync("src/app/api/admin/mesa/route.ts", "utf8");
    const sql = readFileSync("supabase/migrations/20261124040000_mesa_prepare_arrival.sql", "utf8");
    expect(route).toContain("await requireMesa()");
    expect(route).toContain("processMesaScan");
    expect(process).toContain("mesa_prepare_arrival");
    expect(process).toContain("guestQuery");
    expect(process).toContain('.from("arrivals")');
    expect(sql).toContain("rsvp_passes");
    expect(sql).toContain("session_rsvps");
  });
});
