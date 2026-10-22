import { describe, expect, it } from "vitest";
import { handInviteRow } from "./hand-invite";

describe("invitación a mano", () => {
  it("pide nombre, empresa y un correo", () => {
    expect(handInviteRow({ nombre: "Luis", empresa: "Sur", correo: "Luis@Sur.mx" })).toEqual({
      nombre: "Luis",
      empresa: "Sur",
      correo: "luis@sur.mx",
    });
    expect(handInviteRow({ nombre: "", empresa: "Sur", correo: "luis@sur.mx" })).toBeNull();
    expect(handInviteRow({ nombre: "Luis", empresa: "Sur", correo: "no-es-correo" })).toBeNull();
  });
});
