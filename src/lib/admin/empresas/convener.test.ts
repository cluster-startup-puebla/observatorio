import { describe, expect, it } from "vitest";
import { convenerByEmail, convenerLabel, organizationName, ownerEmail } from "./convener";

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

  it("agrupa por correo", () => {
    const convened = convenerByEmail([
      { email: "Ana@Org.mx", name: "CLAUZ Puebla" },
      { email: "ana@org.mx", name: "CANACINTRA Puebla" },
    ]);
    expect(convened.get("ana@org.mx")).toBe("CANACINTRA Puebla, CLAUZ Puebla");
    expect(convened.get("otro@org.mx")).toBeUndefined();
  });
});
