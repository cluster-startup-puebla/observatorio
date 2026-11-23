import { render } from "@react-email/render";
import { describe, expect, it } from "vitest";
import { WelcomeMail } from "./welcome-mail";

describe("correo de bienvenida", () => {
  it("habla de beneficios sin datos del foro", async () => {
    const html = await render(<WelcomeMail continueHref="https://observatorio.example/login" />);
    expect(html).toContain("Tu cuenta ya está lista");
    expect(html).toContain("diagnóstico de tu sector");
    expect(html).toContain("innovación abierta");
    expect(html).toContain("https://observatorio.example/login");
    expect(html).toContain("Iniciar sesión");
    expect(html).not.toContain("organismo te acepte");
    expect(html).not.toContain("Hotel Quinta Real");
    expect(html).not.toContain("Fecha:");
    expect(html).not.toContain("Dónde:");
    expect(html).not.toContain("Horario:");
    expect(html).not.toContain("cid:pase");
  });

  it("sin sitio igual muestra el botón al sitio publicado", async () => {
    const html = await render(<WelcomeMail continueHref={null} />);
    expect(html).toContain("Iniciar sesión");
    expect(html).toContain("https://observatorio.clusterdestartups.org/login");
  });
});
