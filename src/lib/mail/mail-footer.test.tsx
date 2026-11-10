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
    expect(html).toContain("https://observatorio.example/logos/logo-cluster.webp");
    expect(html).toContain("https://observatorio.example/logos/logo-estado.svg");
    expect(html).toContain("https://observatorio.example/logos/logo-sedetra.png");
    expect(html).toContain("https://observatorio.example/logos/logo-cinco-de-mayo.png");
    expect(html).toContain("https://observatorio.example/logos/convocantes/cluster-agroalimentario-puebla.webp");
    expect(html).toContain("https://observatorio.example/logos/convocantes/citex-puebla-tlaxcala.webp");
    expect(html.match(/observatorio\.example\/logos\//g)?.length).toBe(20);
    expect(html).toContain("https://observatorio.example/logos/convocantes/cluster-educacion-desarrollo-talento.webp");
    expect(html).toContain("https://observatorio.example/logos/convocantes/canagraf.webp");
    expect(html).toContain("https://observatorio.example/logos/convocantes/puebla-care.webp");
    expect(html).toContain("Opera");
    expect(html).toContain("Con el respaldo de");
    expect(html).toContain("Convocan");
    expect(html).toContain("hola@clusterdestartups.org");
  });
});
