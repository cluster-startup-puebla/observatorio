import { render } from "@react-email/render";
import { describe, expect, it } from "vitest";
import { WelcomeMail } from "./welcome-mail";

describe("correo de bienvenida", () => {
  it("avisa que la cuenta existe y manda a iniciar sesión", async () => {
    const html = await render(<WelcomeMail continueHref="https://observatorio.example/login" />);
    expect(html).toContain("Tu cuenta ya fue creada");
    expect(html).toContain("termina el perfil de tu empresa");
    expect(html).toContain("https://observatorio.example/login");
    expect(html).toContain("Iniciar sesión");
    expect(html).not.toContain("Tu lugar ya está apartado");
    expect(html).not.toContain("Ahí queda tu pase");
    expect(html).toContain("Hotel Quinta Real, Puebla");
    expect(html).not.toContain("cid:pase");
  });

  it("sin sitio igual muestra el botón al sitio publicado", async () => {
    const html = await render(<WelcomeMail continueHref={null} />);
    expect(html).toContain("Iniciar sesión");
    expect(html).toContain("https://observatorio.clusterdestartups.org/login");
    expect(html).not.toContain("Inicia sesión para terminar tu perfil.");
  });
});
