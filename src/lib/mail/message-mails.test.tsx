import { render } from "@react-email/render";
import { describe, expect, it } from "vitest";
import { EventPassMail } from "./event-pass-mail";
import { OpenInnovationMail } from "./open-innovation-mail";
import { ReminderMail } from "./reminder-mail";
import { ThanksMail } from "./thanks-mail";

const session = "Hotel Quinta Real, Puebla · 18 de noviembre de 2026 · 08:00–11:45";

describe("cuerpos del foro", () => {
  it("el pase trae el QR y la sesión", async () => {
    const html = await render(<EventPassMail sessionLabel={session} />);
    expect(html).toContain("Tu pase ya está listo");
    expect(html).toContain("cid:pase");
    expect(html).toContain(session);
  });

  it("el recordatorio trae el QR y la sesión", async () => {
    const html = await render(<ReminderMail sessionLabel={session} />);
    expect(html).toContain("Mañana nos vemos");
    expect(html).toContain("cid:pase");
    expect(html).toContain(session);
  });

  it("innovación abierta pide respuesta y no trae QR", async () => {
    const html = await render(<OpenInnovationMail />);
    expect(html).toContain("innovación abierta");
    expect(html).toContain("Responde a este correo");
    expect(html).not.toContain("cid:pase");
  });

  it("el gracias no trae QR", async () => {
    const html = await render(<ThanksMail sessionLabel={session} />);
    expect(html).toContain("Gracias por venir");
    expect(html).toContain(session);
    expect(html).not.toContain("cid:pase");
  });
});
