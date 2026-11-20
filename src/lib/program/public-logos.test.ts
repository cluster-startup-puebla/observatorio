import { describe, expect, it } from "vitest";
import { eventLogoSrc, publicLogos } from "./public-logos";

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

  it("publica el nombre y la ruta de la imagen", () => {
    expect(
      publicLogos(
        [{ name: "Norte", showLogoOnEvent: true, purpose: "company_logo", objectPath: "p1" }],
        src,
      ),
    ).toEqual([{ name: "Norte", src: "/api/programa/logo/p1" }]);
  });
});
