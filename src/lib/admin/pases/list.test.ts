import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { canMarkArrival } from "./arrival";

describe("lista de pases", () => {
  it("sin pase no llega y un segundo escaneo no repite", () => {
    expect(canMarkArrival({ hasPass: false, hasArrival: false })).toEqual({ ok: false, reason: "sin qr" });
    expect(canMarkArrival({ hasPass: true, hasArrival: false })).toEqual({ ok: true });
    expect(canMarkArrival({ hasPass: true, hasArrival: true })).toEqual({ ok: false, reason: "ya llegó" });
  });

  it("la lista une RSVP y legacy con búsqueda y sector", () => {
    const list = readFileSync("src/lib/admin/pases/list.ts", "utf8");
    const load = readFileSync("src/lib/admin/pases/load-pass-list.ts", "utf8");
    const page = readFileSync("src/app/admin/pases/page.tsx", "utf8");
    const ui = readFileSync("src/app/admin/pases/pases-list.tsx", "utf8");
    expect(load).toContain("rsvp_passes");
    expect(load).toContain('.from("passes")');
    expect(list).toContain("matchesQ");
    expect(list).toContain("sector");
    expect(page).toContain("params.q");
    expect(page).toContain("params.sector");
    expect(ui).toContain("session");
    expect(ui).toContain("cuenta");
    expect(ui).toContain("issued_label");
  });
});
