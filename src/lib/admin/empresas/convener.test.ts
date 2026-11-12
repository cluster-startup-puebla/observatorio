import { describe, expect, it } from "vitest";
import { convenerByEmail, convenerHrefs, convenerLabel, organizationName, ownerEmail, statusByEmail } from "./convener";

describe("organismo que convocó", () => {
  it("deja un guion cuando no hay organismo", () => {
    expect(convenerLabel([])).toBe("—");
    expect(convenerLabel(["  "])).toBe("—");
  });

  it("junta los nombres distintos en orden español", () => {
    expect(convenerLabel(["  CANACINTRA Puebla  ", "CANACINTRA Puebla"])).toBe("CANACINTRA Puebla");
    expect(convenerLabel(["CLAUZ Puebla", "CANACINTRA Puebla"])).toBe("CANACINTRA Puebla, CLAUZ Puebla");
  });

  it("lee el correo del dueño en minúsculas", () => {
    expect(ownerEmail(null)).toBe("");
    expect(ownerEmail({ email: " Ana@Org.mx " })).toBe("ana@org.mx");
    expect(ownerEmail([{ email: "ana@org.mx" }])).toBe("ana@org.mx");
  });

  it("lee el nombre aunque el embed venga en arreglo", () => {
    expect(organizationName(null)).toBe("");
    expect(organizationName({ name: "CANACINTRA Puebla" })).toBe("CANACINTRA Puebla");
    expect(organizationName([{ name: "CANACINTRA Puebla" }])).toBe("CANACINTRA Puebla");
  });

  it("junta el estatus del mismo correo", () => {
    const statuses = statusByEmail([
      { email: "Ana@Org.mx", status: "cargado" },
      { email: "ana@org.mx", status: null },
      { email: "ana@org.mx", status: "confirmo" },
    ]);
    expect(statuses.get("ana@org.mx")).toEqual(["cargado", "confirmo"]);
  });

  it("apunta cada organismo a su detalle", () => {
    const convened = convenerHrefs([
      { email: "Ana@Org.mx", name: "CANACINTRA Puebla", id: "79d556b0-8ac7-4aba-a74b-c2debfec57c5" },
      { email: "ana@org.mx", name: "CANACINTRA Puebla", id: "79d556b0-8ac7-4aba-a74b-c2debfec57c5" },
      { email: "ana@org.mx", name: "CLAUZ Puebla", id: "org-2" },
    ]);
    expect(JSON.parse(convened.get("ana@org.mx") ?? "[]")).toEqual([
      { name: "CANACINTRA Puebla", href: "/admin/organismos/79d556b0-8ac7-4aba-a74b-c2debfec57c5" },
      { name: "CLAUZ Puebla", href: "/admin/organismos/org-2" },
    ]);
    expect(convened.get("otro@org.mx")).toBeUndefined();
  });

  it("agrupa por correo", () => {
    const convened = convenerByEmail([
      { email: "Ana@Org.mx", name: "CLAUZ Puebla" },
      { email: "ana@org.mx", name: "CANACINTRA Puebla" },
    ]);
    expect(convened.get("ana@org.mx")).toBe("CANACINTRA Puebla, CLAUZ Puebla");
    expect(convened.get("otro@org.mx")).toBeUndefined();
  });
});
