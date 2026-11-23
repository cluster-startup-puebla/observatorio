import { render } from "@react-email/render";
import { describe, expect, it } from "vitest";
import { EventPassMail } from "./event-pass-mail";

describe("pase con cuenta opcional", () => {
  it("incluye CTA cuando hay accountHref", async () => {
    const href = "https://observatorio.example/crear-cuenta?correo=ana%40norte.mx";
    const html = await render(<EventPassMail sessionLabel="Disruptors" accountHref={href} />);
    expect(html).toContain("Tu pase ya está listo");
    expect(html).toContain("Crear cuenta");
    expect(html).toContain(href);
    expect(html).not.toContain("No necesitas crear cuenta");
  });
});
