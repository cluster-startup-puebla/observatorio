import { describe, expect, it } from "vitest";
import { can, type Action, type Role } from "./access";

const roles: Role[] = [
  "superadmin",
  "moderador",
  "empresario",
  "director",
  "capturista",
  "invitador",
];

const actions: Action[] = [
  "manage_all",
  "desk_scan",
  "edit_brand",
  "upload_excel",
  "create_invite",
  "copy_link",
  "view_crm",
  "send_mass_email",
  "answer_methodology",
];

const matrix: Record<Role, Action[]> = {
  superadmin: actions,
  moderador: ["desk_scan"],
  empresario: ["answer_methodology"],
  director: ["edit_brand", "upload_excel", "create_invite", "copy_link", "view_crm"],
  capturista: ["upload_excel", "create_invite", "view_crm"],
  invitador: ["create_invite", "copy_link", "view_crm"],
};

describe("can", () => {
  it("el superadmin puede todo", () => {
    for (const action of actions) expect(can("superadmin", action)).toBe(true);
  });

  it("el moderador solo escanea en la mesa", () => {
    expect(can("moderador", "desk_scan")).toBe(true);
    expect(can("moderador", "view_crm")).toBe(false);
    expect(can("moderador", "send_mass_email")).toBe(false);
  });

  it("el empresario solo contesta la metodología", () => {
    expect(can("empresario", "answer_methodology")).toBe(true);
    expect(can("empresario", "view_crm")).toBe(false);
  });

  it("separa el trabajo dentro del organismo", () => {
    expect(can("director", "edit_brand")).toBe(true);
    expect(can("director", "upload_excel")).toBe(true);
    expect(can("director", "copy_link")).toBe(true);
    expect(can("capturista", "upload_excel")).toBe(true);
    expect(can("capturista", "copy_link")).toBe(false);
    expect(can("capturista", "edit_brand")).toBe(false);
    expect(can("invitador", "copy_link")).toBe(true);
    expect(can("invitador", "create_invite")).toBe(true);
    expect(can("invitador", "upload_excel")).toBe(false);
    expect(can("invitador", "edit_brand")).toBe(false);
  });

  it("un rol desconocido no puede nada", () => {
    expect(can("visitante" as Role, "view_crm")).toBe(false);
    expect(roles).toHaveLength(6);
  });

  it("cada rol solo tiene las acciones de su matriz", () => {
    for (const role of roles) {
      for (const action of actions) {
        expect(can(role, action)).toBe(matrix[role].includes(action));
      }
    }
  });

  it("quien no es superadmin no manda el correo masivo ni administra todo", () => {
    for (const role of roles.filter((item) => item !== "superadmin")) {
      expect(can(role, "manage_all")).toBe(false);
      expect(can(role, "send_mass_email")).toBe(false);
    }
  });
});
