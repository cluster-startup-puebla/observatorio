import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { canMarkArrival } from "./arrival";

describe("lista de pases", () => {
  it("sin pase no llega y un segundo escaneo no repite", () => {
    expect(canMarkArrival({ hasPass: false, hasArrival: false })).toEqual({ ok: false, reason: "sin qr" });
    expect(canMarkArrival({ hasPass: true, hasArrival: false })).toEqual({ ok: true });
    expect(canMarkArrival({ hasPass: true, hasArrival: true })).toEqual({ ok: false, reason: "ya llegó" });
  });

  it("la lista lee passes y arrivals", () => {
    const list = readFileSync("src/lib/admin/pases/list.ts", "utf8");
    const route = readFileSync("src/app/api/admin/pases/route.ts", "utf8");
    expect(list).toContain('.from("passes")');
    expect(list).toContain('.from("arrivals")');
    expect(list).toContain("profile_id");
    expect(list).toContain(".range(page.from, page.to)");
    expect(route).toContain("await requireSuperadmin()");
  });
});
