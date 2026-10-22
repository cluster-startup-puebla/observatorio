import { beforeEach, describe, expect, it } from "vitest";
import { bootstrapAdminErrors } from "./bootstrap-admin";
import { getDirectory, resetDirectory } from "./memory-directory";

describe("primer superadmin", () => {
  beforeEach(() => resetDirectory());

  it("rechaza correo y contraseña inválidos", () => {
    expect(bootstrapAdminErrors({ email: "no-es-correo", password: "corta" })).toEqual({
      email: "Escribe un correo válido.",
      password: "Usa al menos 8 caracteres.",
    });
    expect(bootstrapAdminErrors({ email: "ana@norte.mx", password: "secreto-largo" })).toBeNull();
  });

  it("crea solo el primero y un empresario no cuenta", async () => {
    const directory = getDirectory();
    expect(await directory.superadminCount()).toBe(0);
    await directory.createAccount({ email: "ana@norte.mx", role: "empresario" });
    expect(await directory.superadminCount()).toBe(0);
    const first = await directory.createFirstSuperadmin({
      email: " Ana@Admin.mx ",
      password: "secreto-largo",
    });
    expect(first).toEqual({ ok: true, id: "p2" });
    expect(await directory.superadminCount()).toBe(1);
    expect(await directory.findByEmail("ana@admin.mx")).toMatchObject({ role: "superadmin" });
    expect(
      await directory.createFirstSuperadmin({ email: "otro@admin.mx", password: "secreto-largo" }),
    ).toEqual({ ok: false, reason: "ya existe" });
    expect(await directory.superadminCount()).toBe(1);
    expect(
      await directory.loginSuperadmin({ email: "ana@admin.mx", password: "otra-clave" }),
    ).toEqual({ ok: false, reason: "credenciales" });
    expect(
      await directory.loginSuperadmin({ email: " Ana@Admin.mx ", password: "secreto-largo" }),
    ).toEqual({ ok: true, id: "p2" });
  });
});
