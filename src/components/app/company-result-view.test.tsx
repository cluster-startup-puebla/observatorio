import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { emptyCompanyHome } from "@/lib/app/company-score";
import { liveSession } from "@/lib/methodology/v2/live-session";
import { CompanyScreen } from "./company-screen";

it("monta el cierre de la metodología en la empresa", () => {
  const { questions, answers } = liveSession();
  const html = renderToStaticMarkup(
    <CompanyScreen
      home={{
        ...emptyCompanyHome,
        legalName: "Aceros",
        result: {
          questions,
          answers,
          roadmap: [{ band: "bronce", min: 0, max: null, actions: ["Capa A (Digital/TI): Registrar el scrap."] }],
          trace: {
            finishedAt: "2026-11-20T00:00:00Z",
            instrumentId: "automotriz",
            band: "bronce",
            ismsNivel2: 40,
            actions: [{ place: "company", text: "Registrar el scrap." }],
          },
        },
      }}
    />,
  );
  expect(html).toContain("De dónde sale");
  expect(html).toContain("Siguientes pasos");
  expect(html).toContain("Registrar el scrap.");
  expect(html).toContain("Tu lugar en el sector");
  expect(html).not.toContain("Ver el reporte");
});
