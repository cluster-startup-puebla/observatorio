import { beforeEach, describe, expect, it } from "vitest";
import { getDirectory, resetDirectory } from "./memory-directory";

describe("mesa y correo", () => {
  beforeEach(() => resetDirectory());

  it("solo quien terminó el perfil llega por QR", async () => {
    const directory = getDirectory();
    const account = await directory.createAccount({ email: "ana@norte.mx", role: "empresario" });
    expect(await directory.scanQr(account.id)).toEqual({ ok: false, reason: "sin qr" });
    await directory.completeOnboarding(account.id, { sectorSlug: "turismo", size: "1–10", name: "Ana López" });
    expect(await directory.scanQr(account.id)).toEqual({ ok: true, name: "Ana López", status: "llego" });
  });

  it("el aviso de innovación abierta sale a los registrados", async () => {
    const directory = getDirectory();
    const ready = await directory.createAccount({ email: "ana@norte.mx", role: "empresario" });
    const pending = await directory.createAccount({ email: "beto@sur.mx", role: "empresario" });
    await directory.completeOnboarding(ready.id, { sectorSlug: "turismo", size: "1–10", name: "Ana" });
    await directory.sendOpenInnovation();
    const outbox = await directory.outbox();
    expect(outbox.map((mail) => mail.to)).toEqual(["ana@norte.mx"]);
    expect(outbox[0].subject).toBe("¿Quieres ser una empresa de innovación abierta?");
    expect(outbox.some((mail) => mail.to === "beto@sur.mx")).toBe(false);
    expect(pending.id).not.toBe(ready.id);
  });

  it("llegar dos veces no retrocede y un id desconocido no entra", async () => {
    const directory = getDirectory();
    const account = await directory.createAccount({ email: "ana@norte.mx", role: "empresario" });
    await directory.completeOnboarding(account.id, { sectorSlug: "turismo", size: "1–10", name: "Ana" });
    expect((await directory.scanQr(account.id)).ok).toBe(true);
    expect(await directory.scanQr(account.id)).toEqual({ ok: false, reason: "transición inválida" });
    expect(await directory.scanQr("nadie")).toEqual({ ok: false, reason: "sin qr" });
  });

  it("un invitado cargado sin perfil no recibe el correo masivo", async () => {
    const directory = getDirectory();
    const org = await directory.createAccount({ email: "dir@camara.mx", role: "director" });
    await directory.completeOnboarding(org.id, { sectorSlug: "turismo", size: "11–50", name: "Cámara" });
    await directory.importInvites(org.id, [{ nombre: "Ana", empresa: "Norte", correo: "ana@norte.mx" }]);
    await directory.sendOpenInnovation();
    const outbox = await directory.outbox();
    expect(outbox.map((mail) => mail.to)).toEqual(["dir@camara.mx"]);
  });
});
