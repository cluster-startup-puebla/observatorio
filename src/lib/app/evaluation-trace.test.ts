import { describe, expect, it } from "vitest";
import { evaluationTrace } from "./evaluation-trace";

describe("evaluationTrace", () => {
  it("guarda las acciones como las muestra el cierre", () => {
    const trace = evaluationTrace({
      finishedAt: "2026-11-20T00:00:00Z",
      instrumentId: "plasticos",
      band: "plata",
      ismsNivel2: 51.79,
      signals: ["Capacitar a quien ya tiene el sistema."],
      actions: [
        "Capa A (Digital/TI): Registrar el scrap.",
        "Capa B (Bienes de Club): Comprar resina juntos.",
        "Anotar el lote en un cuaderno.",
      ],
    });
    expect(trace.finishedAt).toBe("2026-11-20T00:00:00Z");
    expect(trace.actions).toEqual([
      { place: "signal", text: "Capacitar a quien ya tiene el sistema." },
      { place: "plain", text: "Anotar el lote en un cuaderno." },
      { place: "company", text: "Registrar el scrap." },
      { place: "region", text: "Comprar resina juntos." },
    ]);
  });
});
