import { beforeEach, describe, expect, it } from "vitest";
import { getDirectory, resetDirectory } from "../memory-directory";

describe("ficha del crm", () => {
  beforeEach(() => resetDirectory());

  it("completa nombre, empresa y sector desde el perfil", async () => {
    const directory = getDirectory();
    const org = await directory.createAccount({ email: "dir@camara.mx", role: "director" });
    const token = await directory.copyEventLink(org.id, "minerales-no-metalicos");
    const account = await directory.createAccount({ email: "pavo@gmail.com", role: "empresario" });
    await directory.attributeRegistration({
      token,
      email: "pavo@gmail.com",
      sectorSlug: "minerales-no-metalicos",
    });
    await directory.completeOnboarding(account.id, {
      sectorSlug: "minerales-no-metalicos",
      size: "1–10",
      name: "Pavo Pérez",
      companyName: "Cantera Sur",
    });
    const [person] = await directory.crm(org.id);
    expect(person).toMatchObject({
      nombre: "Pavo Pérez",
      empresa: "Cantera Sur",
      correo: "pavo@gmail.com",
      sector: "minerales-no-metalicos",
    });
  });
});