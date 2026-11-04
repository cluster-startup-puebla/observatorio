import { render } from "@react-email/render";
import { describe, expect, it } from "vitest";
import { MailShell } from "./shell";

describe("cascarón del correo", () => {
  it("pinta la franja rosa, el navy y el nombre del foro", async () => {
    const html = await render(
      <MailShell preview="Vista previa" title="Título">
        <p>Cuerpo</p>
      </MailShell>,
    );
    expect(html).toContain("#e8186a");
    expect(html).toContain("#16284f");
    expect(html).toContain("Levantamiento de necesidades tecnológicas");
    expect(html).toContain("Foro Puebla x Puebla");
    expect(html).toContain("Título");
    expect(html).toContain("Cuerpo");
    expect(html).toContain("hola@clusterdestartups.org");
  });
});
