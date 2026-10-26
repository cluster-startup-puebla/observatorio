import { describe, expect, it } from "vitest";
import { broadcastSentLine } from "./sent-line";

describe("resultado del correo masivo", () => {
  it("el cero explica que no había correos nuevos", () => {
    expect(broadcastSentLine(0)).toBe("No había correos nuevos por enviar.");
  });

  it("un envío dice cuántos salieron", () => {
    expect(broadcastSentLine(1)).toBe("Se envió 1 correo.");
    expect(broadcastSentLine(4)).toBe("Se enviaron 4 correos.");
  });
});
