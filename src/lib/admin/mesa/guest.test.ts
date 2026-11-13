import { describe, expect, it } from "vitest";
import { guestQuery, mesaGuest } from "./guest";

describe("ficha de la mesa", () => {
  it("arma el saludo con empresa, sector y quien invitó", () => {
    const guest = mesaGuest({
      full_name: " Alvaro ",
      company_name: "sabia.dev",
      sector_name: "Plásticos",
      invited_by: "Clúster",
    });
    expect(guest).toEqual({
      name: "Alvaro",
      company: "sabia.dev",
      sector: "Plásticos",
      invitedBy: "Clúster",
    });
    const query = new URLSearchParams(guestQuery("p1", guest));
    expect(query.get("estatus")).toBe("llego");
    expect(query.get("nombre")).toBe("Alvaro");
    expect(query.get("empresa")).toBe("sabia.dev");
    expect(query.get("sector")).toBe("Plásticos");
    expect(query.get("invito")).toBe("Clúster");
  });

  it("omite los datos vacíos", () => {
    const query = new URLSearchParams(guestQuery("p1", mesaGuest(null)));
    expect(query.get("nombre")).toBeNull();
    expect(query.get("estatus")).toBe("llego");
  });
});
