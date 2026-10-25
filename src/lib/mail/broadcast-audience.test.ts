import { describe, expect, it } from "vitest";
import { broadcastAudience } from "./broadcast-audience";

const people = [
  { id: "ana", email: "ana@norte.mx", onboarded: true, arrived: false },
  { id: "beto", email: "beto@sur.mx", onboarded: true, arrived: true },
  { id: "luz", email: "", onboarded: true, arrived: false },
  { id: "ivo", email: "ivo@este.mx", onboarded: false, arrived: false },
];

describe("audiencia masiva", () => {
  it("la innovación abierta va a quien terminó el perfil", () => {
    expect(broadcastAudience("open_innovation", people).map((person) => person.id)).toEqual(["ana", "beto"]);
  });

  it("el recordatorio deja fuera a quien ya llegó", () => {
    expect(broadcastAudience("reminder", people).map((person) => person.id)).toEqual(["ana"]);
  });

  it("el gracias va a quien ya llegó", () => {
    expect(broadcastAudience("thanks", people).map((person) => person.id)).toEqual(["beto"]);
  });
});
