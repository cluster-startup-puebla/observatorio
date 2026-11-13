import { render } from "@react-email/render";
import { describe, expect, it } from "vitest";
import { MailShell } from "./shell";

describe("pie de logos", () => {
  it("muestra clúster, gobierno y los convocantes", async () => {
    const html = await render(
      <MailShell preview="Vista" title="Título" assetBase="https://observatorio.example">
        <p>Cuerpo</p>
      </MailShell>,
    );
    expect(html).toContain("https://observatorio.example/logos/correo/logo-cluster.png");
    expect(html).toContain("https://observatorio.example/logos/correo/logo-estado.png");
    expect(html).toContain("https://observatorio.example/logos/correo/logo-sedetra.png");
    expect(html).toContain("https://observatorio.example/logos/correo/logo-secihti.png");
    expect(html).toContain("https://observatorio.example/logos/correo/logo-por-amor-a-puebla.png");
    expect(html).toContain("https://observatorio.example/logos/correo/logo-transformar-en-grande.png");
    expect(html).not.toContain("logo-cinco-de-mayo.png");
    expect(html).not.toContain(".webp");
    expect(html).not.toContain(".svg");
    expect(html).toContain("https://observatorio.example/logos/correo/convocantes/cluster-agroalimentario-puebla.png");
    expect(html).toContain("https://observatorio.example/logos/correo/convocantes/citex-puebla-tlaxcala.png");
    expect(html.match(/observatorio\.example\/logos\//g)?.length).toBe(22);
    expect(html).toContain("https://observatorio.example/logos/correo/convocantes/cluster-educacion-desarrollo-talento.png");
    expect(html).toContain("https://observatorio.example/logos/correo/convocantes/canagraf.png");
    expect(html).toContain("https://observatorio.example/logos/correo/convocantes/puebla-care.png");
    expect(html).toContain("Opera");
    expect(html).toContain("Con el respaldo de");
    expect(html).toContain("Convocan");
    expect(html).toContain("hola@clusterdestartups.org");
    expect(html).toContain("Revisa la bandeja de correo no deseado.");
  });
});
