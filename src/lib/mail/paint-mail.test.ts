import { describe, expect, it } from "vitest";
import { paintMail } from "./paint-mail";

const profileId = "360ab36d-9882-44c6-9b61-1010b9aab795";

describe("pintar correo", () => {
  it("la bienvenida no adjunta pase", async () => {
    const painted = await paintMail({ kind: "welcome", profileId, sessionLabel: null, continueHref: null, acceptHref: null });
    expect(painted.html).toContain("Tu lugar ya está apartado");
    expect(painted.html).toContain("Revisa la bandeja de correo no deseado.");
    expect(painted.attachments).toEqual([]);
  });

  it("el recordatorio adjunta el png y lo cita", async () => {
    const painted = await paintMail({
      kind: "reminder",
      profileId,
      sessionLabel: "Hotel Quinta Real, Puebla · 18 de noviembre de 2026 · 08:00–11:45",
      continueHref: null,
      acceptHref: null,
    });
    expect(painted.html).toContain("Mañana nos vemos");
    expect(painted.html).toContain("Revisa la bandeja de correo no deseado.");
    expect(painted.html).toContain("cid:pase");
    expect(painted.attachments).toHaveLength(1);
    expect(painted.attachments[0].contentId).toBe("pase");
  });

  it("el pase adjunta el png y lo cita", async () => {
    const painted = await paintMail({
      kind: "event_pass",
      profileId,
      sessionLabel: null,
      continueHref: null,
      acceptHref: null,
    });
    expect(painted.html).toContain("cid:pase");
    expect(painted.html).toContain("Revisa la bandeja de correo no deseado.");
    expect(painted.attachments).toHaveLength(1);
    expect(painted.attachments[0].contentId).toBe("pase");
  });

  it("el recordatorio sin perfil no inventa un QR", async () => {
    await expect(
      paintMail({ kind: "reminder", profileId: null, sessionLabel: null, continueHref: null, acceptHref: null }),
    ).rejects.toThrow("sin pase");
  });

  it("el pase también exige perfil", async () => {
    await expect(
      paintMail({ kind: "event_pass", profileId: "  ", sessionLabel: null, continueHref: null, acceptHref: null }),
    ).rejects.toThrow("sin pase");
  });

  it("innovación abierta exige el enlace", async () => {
    await expect(
      paintMail({
        kind: "open_innovation",
        profileId: profileId,
        sessionLabel: null,
        continueHref: null,
        acceptHref: null,
      }),
    ).rejects.toThrow("sin permiso");
  });

  it("innovación abierta pinta el enlace y no adjunta pase", async () => {
    const href = "https://observatorio.example/innovacion-abierta/aceptar?t=abc";
    const painted = await paintMail({
      kind: "open_innovation",
      profileId: profileId,
      sessionLabel: null,
      continueHref: null,
      acceptHref: href,
    });
    expect(painted.html).toContain(href);
    expect(painted.html).toContain("Revisa la bandeja de correo no deseado.");
    expect(painted.attachments).toEqual([]);
  });
});
