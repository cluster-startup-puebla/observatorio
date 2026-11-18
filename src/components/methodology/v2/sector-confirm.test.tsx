import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { initialInstrument } from "./screen-phase";
import { SectorConfirm } from "./sector-confirm";

it("plásticos enfrenta el registro con el único instrumento y deja confirmar", () => {
  const html = renderToStaticMarkup(
    <SectorConfirm
      brought="Plásticos y Economía circular"
      options={[{ id: "plasticos", label: "04. Plásticos, Polímeros y Economía Circular" }]}
      onConfirm={() => undefined}
    />,
  );
  expect(html).toContain("Plásticos y Economía circular");
  expect(html).toContain(">vs<");
  expect(html).toContain("04. Plásticos, Polímeros y Economía Circular");
  expect(html).toContain("Confirmar");
  expect(html).not.toContain("disabled");
  expect(initialInstrument(null, { kind: "one", id: "plasticos" }, ["plasticos"])).toBe("");
  const started = {
    instrumentId: "plasticos",
    answers: {},
    index: 1,
    phase: "general" as const,
    updatedAt: "2026-11-18T00:00:00.000Z",
    sentAt: null,
  };
  expect(initialInstrument(started, { kind: "one", id: "plasticos" }, ["plasticos"])).toBe("plasticos");
});

it("textil no confirma hasta elegir hilados o confección", () => {
  const html = renderToStaticMarkup(
    <SectorConfirm
      brought="Textil y confección"
      options={[
        { id: "textiles", label: "06. Textiles, Hilados y Tejidos" },
        { id: "confeccion", label: "07. Diseño, Confección y Maquila de Prendas" },
      ]}
      onConfirm={() => undefined}
    />,
  );
  expect(html).toContain("Hilados");
  expect(html).toContain("Confección");
  expect(html).toContain("disabled");
});
