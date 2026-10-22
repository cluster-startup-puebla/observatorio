import { beforeEach, describe, expect, it } from "vitest";
import { getDirectory, resetDirectory } from "./memory-directory";

describe("crm en memoria", () => {
  beforeEach(() => resetDirectory());

  it("carga filas, atribuye el registro y calcula la conversión", async () => {
    const directory = getDirectory();
    const org = await directory.createAccount({ email: "dir@camara.mx", role: "director" });
    await directory.completeOnboarding(org.id, { sectorSlug: "turismo", size: "51–250" });
    await directory.importInvites(org.id, [
      { nombre: "Ana", empresa: "Norte", correo: "ana@norte.mx" },
    ]);
    const people = await directory.crm(org.id);
    expect(people[0].status).toBe("cargado");
    const token = await directory.copyEventLink(org.id, "turismo");
    expect(token.includes("ref=")).toBe(false);
    await directory.attributeRegistration({ token, email: "beto@sur.mx" });
    expect(await directory.conversion(org.id, "turismo")).toEqual({ copies: 1, registrations: 1 });
  });

  it("un token alterado no atribuye", async () => {
    const directory = getDirectory();
    const org = await directory.createAccount({ email: "dir@camara.mx", role: "director" });
    const token = await directory.copyEventLink(org.id, "turismo");
    const tampered = `${token}x`;
    await directory.attributeRegistration({ token: tampered, email: "nadie@sur.mx" });
    expect(await directory.conversion(org.id, "turismo")).toEqual({ copies: 1, registrations: 0 });
  });

  it("un correo repetido o inválido no crea otra persona", async () => {
    const directory = getDirectory();
    const org = await directory.createAccount({ email: "dir@camara.mx", role: "director" });
    const rows = [
      { nombre: "Ana", empresa: "Norte", correo: "ana@norte.mx" },
      { nombre: "Ana otra", empresa: "Otra", correo: "ANA@norte.mx" },
      { nombre: "", empresa: "Norte", correo: "vacio@norte.mx" },
    ];
    await directory.importInvites(org.id, rows);
    await directory.importInvites(org.id, rows);
    const people = await directory.crm(org.id);
    expect(people.map((person) => person.correo)).toEqual(["ana@norte.mx"]);
    expect(await directory.crm("otro-organismo")).toEqual([]);
  });

  it("contactar y rechazar solo ocurren desde un estatus abierto", async () => {
    const directory = getDirectory();
    const org = await directory.createAccount({ email: "dir@camara.mx", role: "director" });
    await directory.importInvites(org.id, [
      { nombre: "Ana", empresa: "Norte", correo: "ana@norte.mx" },
      { nombre: "Beto", empresa: "Sur", correo: "beto@sur.mx" },
    ]);
    const [ana, beto] = await directory.crm(org.id);
    expect(await directory.applyCrm(ana.id, "contactar")).toEqual({ ok: true, status: "contactado" });
    expect(await directory.applyCrm(beto.id, "rechazar")).toEqual({ ok: true, status: "no" });
    expect(await directory.applyCrm(beto.id, "contactar")).toEqual({
      ok: false,
      reason: "transición inválida",
    });
  });

  it("sin copia previa el registro no infla la conversión de otro sector", async () => {
    const directory = getDirectory();
    const org = await directory.createAccount({ email: "dir@camara.mx", role: "director" });
    const token = await directory.copyEventLink(org.id, "turismo");
    await directory.attributeRegistration({ token, email: "beto@sur.mx" });
    expect(await directory.conversion(org.id, "logistica")).toEqual({ copies: 0, registrations: 0 });
  });

  it("el enlace no lleva ref= y la marca solo aparece si el organismo terminó", async () => {
    const directory = getDirectory();
    const org = await directory.createAccount({ email: "dir@camara.mx", role: "director" });
    expect(await directory.brandForToken("token-falso")).toBeNull();
    await directory.completeOnboarding(org.id, {
      sectorSlug: "turismo",
      size: "organismo",
      name: "CANACINTRA",
      logoKey: `logos/${org.id}`,
    });
    const token = await directory.copyEventLink(org.id, "turismo");
    expect(token.includes("ref=")).toBe(false);
    expect(await directory.brandForToken(token)).toEqual({
      name: "CANACINTRA",
      logoKey: `logos/${org.id}`,
    });
  });

  it("la cuenta del invitado confirma y el perfil lo registra", async () => {
    const directory = getDirectory();
    const org = await directory.createAccount({ email: "dir@camara.mx", role: "director" });
    await directory.importInvites(org.id, [{ nombre: "Ana", empresa: "Norte", correo: "ana@norte.mx" }]);
    const account = await directory.createAccount({ email: "ana@norte.mx", role: "empresario" });
    expect((await directory.crm(org.id))[0].status).toBe("confirmo");
    await directory.completeOnboarding(account.id, { sectorSlug: "turismo", size: "1–10", name: "Ana" });
    expect((await directory.crm(org.id))[0].status).toBe("registrado");
  });
});
