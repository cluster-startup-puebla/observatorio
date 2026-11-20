import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { CompanyHome } from "@/lib/app/company-score";
import { CompanyScreen } from "./company-screen";

const empty: CompanyHome = {
  legalName: null,
  sectorName: null,
  employeeBand: "  ",
  website: "",
  municipality: null,
  marketSize: null,
  referral: null,
  sessionInterest: null,
  logoUrl: null,
  convenerLogoUrl: null,
  score: null,
  result: null,
  actions: [],
};

describe("CompanyScreen", () => {
  it("omite campos vacíos y no pinta el checklist", () => {
    const html = renderToStaticMarkup(<CompanyScreen home={empty} />);
    expect(html).toContain("Empresa");
    expect(html).toContain("Todavía no hay una evaluación");
    expect(html).not.toContain("Tu lugar en el sector");
    expect(html).not.toContain("El sector");
    expect(html).not.toContain("Pendientes");
    expect(html).not.toContain("Última calificación");
    expect(html).not.toContain("Sitio web");
    expect(html).not.toContain("Tamaño");
  });

  it("muestra los datos, la calificación y los enlaces", () => {
    const html = renderToStaticMarkup(
      <CompanyScreen
        home={{
          legalName: "Aceros",
          sectorName: "Metalmecánica",
          employeeBand: "1_10",
          website: "ejemplo.com",
          municipality: "Puebla",
          marketSize: "local",
          referral: "Un organismo",
          sessionInterest: "Diagnóstico",
          logoUrl: null,
          convenerLogoUrl: "https://cdn.example/org.png",
          score: { band: "oro", ismsNivel2: 72.5 },
          result: null,
          actions: [
            { label: "Sube el logo de tu empresa", href: "/app/home" },
            { label: "Unirme a la sesión", href: "/app/sesiones/hoy" },
          ],
        }}
      />,
    );
    expect(html).toContain("Aceros");
    expect(html).toContain("1–10");
    expect(html).toContain("Local (municipio / zona metropolitana)");
    expect(html).toContain("72.50");
    expect(html).toContain("Oro");
    expect(html).toContain("Madurez de conjunto");
    expect(html).not.toContain("Última calificación");
    expect(html).toContain("Metalmecánica");
    expect(html).toContain("Sector");
    expect(html).toContain("col-span-2");
    expect(html).not.toContain("https://cdn.example/org.png");
    expect(html).toContain("Ver el reporte");
    expect(html).toContain('href="/metodologia"');
    expect(html).not.toContain("Cómo llegó");
    expect(html).not.toContain("Interés");
    expect(html).not.toContain("Un organismo");
    expect(html).not.toContain("Diagnóstico");
    expect(html).toContain("Pendientes");
    expect(html).toContain('href="/app/home"');
    expect(html).toContain('href="/app/sesiones/hoy"');
  });
});
