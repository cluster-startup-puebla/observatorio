import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { attendanceAction } from "./attendance";

describe("asistencia desde la ficha", () => {
  it("permite marcarla solo con pase y registro, y no si ya llegó", () => {
    expect(attendanceAction({ hasPass: false, arrivedAt: "", status: "registrado" }).kind).toBe("missing");
    expect(attendanceAction({ hasPass: true, arrivedAt: "", status: "registrado" }).kind).toBe("ready");
    expect(attendanceAction({ hasPass: true, arrivedAt: "", status: "cargado" }).kind).toBe("blocked");
    expect(attendanceAction({ hasPass: true, arrivedAt: "2026-11-12T18:00:00Z", status: "registrado" }).kind).toBe("done");
  });

  it("el botón escribe la llegada de la mesa y muestra el QR", () => {
    const route = readFileSync("src/app/api/admin/crm/[id]/asistencia/route.ts", "utf8");
    const screen = readFileSync("src/app/admin/crm/[id]/contacto-acceso.tsx", "utf8");
    expect(route).toContain("await requireSuperadmin()");
    expect(route).toContain('.from("arrivals")');
    expect(route).toContain('.from("crm_events")');
    expect(route).toContain("arrivalPlan");
    expect(screen).toContain("Marcar que asistió");
    expect(screen).toContain("/api/admin/medios/");
  });
});