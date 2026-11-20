import { describe, expect, it } from "vitest";
import { eventLogoSrc, publicLogos, uniquePublicLogos } from "./public-logos";

const src = (path: string) => eventLogoSrc(path);

describe("logos públicos del programa", () => {
  it("rechaza a quien no autorizó mostrar el logo", () => {
    expect(
      publicLogos(
        [{ name: "Sur", showLogoOnEvent: false, purpose: "company_logo", objectPath: "p2/logo.png" }],
        src,
      ),
    ).toEqual([]);
  });

  it("rechaza el permiso encendido cuando no hay archivo company_logo", () => {
    expect(
      publicLogos([{ name: "Centro", showLogoOnEvent: true, purpose: null, objectPath: null }], src),
    ).toEqual([]);
  });

  it("deja una sola ficha cuando el nombre se repite", () => {
    const logos = publicLogos(
      [
        { name: "abat", showLogoOnEvent: true, purpose: "company_logo", objectPath: "a" },
        { name: "Abat", showLogoOnEvent: true, purpose: "company_logo", objectPath: "b" },
        { name: "Capleton", showLogoOnEvent: true, purpose: "company_logo", objectPath: "c" },
        { name: "Capleton", showLogoOnEvent: true, purpose: "company_logo", objectPath: "d" },
        { name: "MAK Consultoría Ambiental", showLogoOnEvent: true, purpose: "company_logo", objectPath: "e" },
        { name: "mak consultoría ambiental", showLogoOnEvent: true, purpose: "company_logo", objectPath: "f" },
      ],
      src,
    );
    expect(logos.map((logo) => logo.src)).toEqual([
      "/api/programa/logo/a",
      "/api/programa/logo/c",
      "/api/programa/logo/e",
    ]);
    expect(uniquePublicLogos(logos)).toEqual(logos);
  });

  it("deja una sola ficha cuando el dibujo del logo coincide", () => {
    const logos = uniquePublicLogos([
      { name: "Criteria Inteligencia de Negocios", src: "/a", mark: "111" },
      { name: "CVI160428AG0", src: "/b", mark: "111" },
      { name: "ITEIN", src: "/c", mark: "000" },
    ]);
    expect(logos.map((logo) => logo.name)).toEqual(["Criteria Inteligencia de Negocios", "ITEIN"]);
  });

  it("publica el nombre y la ruta de la imagen", () => {
    expect(
      publicLogos(
        [{ name: "Norte", showLogoOnEvent: true, purpose: "company_logo", objectPath: "p1" }],
        src,
      ),
    ).toEqual([{ name: "Norte", src: "/api/programa/logo/p1" }]);
  });
});
