import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { brandStamp, eventPath } from "./brand";

describe("detalle de organismos", () => {
  it("la marca queda incompleta sin logo y el enlace lleva el sector", () => {
    expect(brandStamp({ name: "CANACINTRA", brandColor: "#1B3A5C", hasLogo: false })).toBeNull();
    expect(brandStamp({ name: null, brandColor: "#1B3A5C", hasLogo: true })).toBeNull();
    const stamped = brandStamp({ name: "CANACINTRA", brandColor: "#1B3A5C", hasLogo: true });
    expect(typeof stamped).toBe("string");
    expect(eventPath("turismo", "abc")).toBe("/turismo?abc");
  });

  it("el detalle lee miembros, crm, copias y logo", () => {
    const source = readFileSync("src/lib/admin/organismos/detail.ts", "utf8");
    const route = readFileSync("src/app/api/admin/organismos/[id]/route.ts", "utf8");
    expect(source).toContain('.from("profiles")');
    expect(source).toContain('.from("crm_contacts")');
    expect(source).toContain('.from("link_copies")');
    expect(source).toContain("organization_logo");
    expect(route).toContain("await requireSuperadmin()");
    expect(route).not.toMatch(/export async function DELETE/);
  });
});
