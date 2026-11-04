import { render } from "@react-email/render";
import { describe, expect, it } from "vitest";
import { WelcomeMail } from "./welcome-mail";

describe("correo de bienvenida", () => {
  it("pide terminar el perfil y no trae pase", async () => {
    const html = await render(<WelcomeMail continueHref="https://observatorio.example/onboarding" />);
    expect(html).toContain("Tu lugar ya está apartado");
    expect(html).toContain("termina el perfil de tu empresa");
    expect(html).toContain("https://observatorio.example/onboarding");
    expect(html).toContain("Hotel Quinta Real, Puebla");
    expect(html).not.toContain("cid:pase");
  });

  it("sin sitio no inventa un botón", async () => {
    const html = await render(<WelcomeMail continueHref={null} />);
    expect(html).toContain("Vuelve al registro e inicia sesión.");
    expect(html).not.toContain('href="http');
  });
});
