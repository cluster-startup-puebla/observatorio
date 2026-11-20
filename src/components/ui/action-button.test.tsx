import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ActionButton } from "./action-button";

describe("ActionButton", () => {
  it("espera con el texto de carga", () => {
    const html = renderToStaticMarkup(
      <form>
        <ActionButton pending pendingLabel="Enviando…">
          Enviar enlace
        </ActionButton>
      </form>,
    );
    expect(html).toContain("Enviando…");
    expect(html).toContain('aria-busy="true"');
    expect(html).toContain("btn-primary");
    expect(html).not.toContain("Enviar enlace");
  });

  it("queda inactivo sin parecer que está enviando", () => {
    const html = renderToStaticMarkup(
      <ActionButton variant="secondary" disabled>
        Rechazar
      </ActionButton>,
    );
    expect(html).toContain("btn-secondary");
    expect(html).toContain("disabled");
    expect(html).toContain('data-state="disabled"');
    expect(html).toContain("Rechazar");
  });
});
