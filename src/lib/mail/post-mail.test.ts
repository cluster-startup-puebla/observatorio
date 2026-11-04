import { describe, expect, it } from "vitest";
import { resendPayload } from "./post-mail";

describe("cuerpo de Resend", () => {
  it("manda desde MAIL_FROM y responde a hola", () => {
    const payload = resendPayload({
      from: "Foro Puebla x Puebla <noreply@notificaciones.clusterdestartups.org>",
      to: "ana@norte.mx",
      subject: "Mañana es la sesión del Observatorio",
      html: "<p>Hola</p>",
      attachments: [],
    });
    expect(payload.from).toContain("noreply@notificaciones.clusterdestartups.org");
    expect(payload.replyTo).toBe("hola@clusterdestartups.org");
    expect(payload.to).toEqual(["ana@norte.mx"]);
    expect(payload.attachments).toBeUndefined();
  });

  it("incluye el png cuando hay pase", () => {
    const payload = resendPayload({
      from: "Foro <noreply@notificaciones.clusterdestartups.org>",
      to: "ana@norte.mx",
      subject: "Mañana es la sesión del Observatorio",
      html: '<img src="cid:pase" />',
      attachments: [{ filename: "pase.png", content: "aGk=", contentType: "image/png", contentId: "pase" }],
    });
    expect(payload.attachments).toEqual([
      { filename: "pase.png", content: "aGk=", contentType: "image/png", contentId: "pase" },
    ]);
  });
});
