import { describe, expect, it } from "vitest";
import { bestMatchingHref } from "@/components/admin/nav-match";
import { homeForRole } from "@/lib/auth/home";
import { orgLinks } from "./nav";

describe("nav del organismo", () => {
  it("tres rutas y el home no se come al CRM", () => {
    const links = orgLinks("coparmex-puebla");
    expect(links.map((link) => link.label)).toEqual(["Inicio", "Invitaciones", "CRM"]);
    const hrefs = links.map((link) => link.href);
    expect(hrefs).toEqual([
      "/coparmex-puebla",
      "/coparmex-puebla/invitaciones",
      "/coparmex-puebla/crm",
    ]);
    expect(bestMatchingHref("/coparmex-puebla/crm", hrefs)).toBe("/coparmex-puebla/crm");
    expect(bestMatchingHref("/coparmex-puebla", hrefs)).toBe("/coparmex-puebla");
  });

  it("con slug el director ya no cae en /organismo", () => {
    expect(homeForRole("director")).toBe("/organismo");
    expect(homeForRole("director", "canacintra")).toBe("/canacintra");
    expect(homeForRole("capturista", "canacintra")).toBe("/canacintra");
    expect(homeForRole("invitador", "canacintra")).toBe("/canacintra");
    expect(homeForRole("superadmin", "canacintra")).toBe("/admin");
  });
});
