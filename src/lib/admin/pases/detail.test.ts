import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { passObjectPath } from "@/lib/storage-assets";
import { arrivalPlan } from "./scan";

const profileId = "11111111-1111-4111-8111-111111111111";

describe("detalle de pases", () => {
  it("muestra el png del pase y escribe llegar solo si el CRM lo permite", () => {
    expect(passObjectPath(profileId)).toBe(`${profileId}/pass.png`);
    expect(arrivalPlan({ hasPass: true, hasArrival: false, crmStatus: "registrado" })).toEqual({
      ok: true,
      insertArrival: true,
      crmEvent: "llegar",
    });
    expect(arrivalPlan({ hasPass: true, hasArrival: false, crmStatus: "cargado" })).toEqual({
      ok: false,
      reason: "transición inválida",
    });
    expect(arrivalPlan({ hasPass: true, hasArrival: true, crmStatus: "llego" })).toEqual({
      ok: false,
      reason: "ya llegó",
    });
    expect(arrivalPlan({ hasPass: false, hasArrival: false, crmStatus: null })).toEqual({
      ok: false,
      reason: "sin qr",
    });
    expect(arrivalPlan({ hasPass: true, hasArrival: false, crmStatus: null })).toEqual({
      ok: true,
      insertArrival: true,
      crmEvent: null,
    });
  });

  it("la llegada inserta arrivals y, si aplica, crm_events", () => {
    const source = readFileSync("src/app/api/admin/pases/[id]/llegada/route.ts", "utf8");
    expect(source).toContain("await requireSuperadmin()");
    expect(source).toContain('.from("arrivals")');
    expect(source).toContain('.from("crm_events")');
    expect(source).toContain("arrivalPlan");
  });
});
