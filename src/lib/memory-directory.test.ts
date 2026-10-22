import { beforeEach, describe, expect, it } from "vitest";
import { getDirectory, resetDirectory } from "./memory-directory";

describe("memory directory", () => {
  beforeEach(() => resetDirectory());

  it("guarda la respuesta en el momento y la recupera", async () => {
    const directory = getDirectory();
    await directory.saveAnswer({ personId: "p1", questionId: "1", value: "a" });
    await directory.saveAnswer({ personId: "p1", questionId: "1", value: "d" });
    expect(await directory.answersFor("p1")).toEqual({ "1": "d" });
  });

  it("el onboarding incompleto no suelta el QR ni la invitación", async () => {
    const directory = getDirectory();
    await directory.createAccount({ email: "ana@norte.mx", role: "empresario" });
    const id = (await directory.findByEmail("ana@norte.mx"))!.id;
    expect(await directory.qrFor(id)).toBeNull();
    await directory.completeOnboarding(id, { sectorSlug: "turismo", size: "11–50" });
    expect(await directory.qrFor(id)).toEqual({ personId: id });
  });

  it("no duplica el correo y no abre el QR de alguien que no existe", async () => {
    const directory = getDirectory();
    const first = await directory.createAccount({ email: " Ana@Norte.mx ", role: "empresario" });
    const second = await directory.createAccount({ email: "ana@norte.mx", role: "director" });
    expect(second.id).toBe(first.id);
    expect((await directory.findByEmail("ana@norte.mx"))?.role).toBe("empresario");
    expect(await directory.findByEmail("nadie@norte.mx")).toBeNull();
    expect(await directory.qrFor("no-existe")).toBeNull();
    await directory.completeOnboarding("no-existe", { sectorSlug: "turismo", size: "1–10" });
    expect(await directory.qrFor("no-existe")).toBeNull();
  });

  it("una respuesta de otra persona no se mezcla", async () => {
    const directory = getDirectory();
    await directory.saveAnswer({ personId: "p1", questionId: "1", value: "a" });
    await directory.saveAnswer({ personId: "p2", questionId: "1", value: "d" });
    expect(await directory.answersFor("p1")).toEqual({ "1": "a" });
    expect(await directory.answersFor("sin-respuestas")).toEqual({});
  });

  it("sin headline el sector no cambia el mensaje", async () => {
    const directory = getDirectory();
    expect(await directory.sectorMessage("turismo")).toBeNull();
  });
});
