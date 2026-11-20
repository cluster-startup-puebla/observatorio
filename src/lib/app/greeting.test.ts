import { describe, expect, it } from "vitest";
import { dayPart, firstName, mexicoHour } from "./greeting";

describe("dayPart", () => {
  it("parte el día según la hora", () => {
    expect(dayPart(8)).toBe("buenos días");
    expect(dayPart(12)).toBe("buenas tardes");
    expect(dayPart(18)).toBe("buenas tardes");
    expect(dayPart(19)).toBe("buenas noches");
    expect(dayPart(0)).toBe("buenos días");
  });
});

describe("mexicoHour", () => {
  it("devuelve la hora de America/Mexico_City", () => {
    expect(mexicoHour(new Date("2026-03-15T14:00:00.000Z"))).toBe(8);
    expect(mexicoHour(new Date("2026-03-15T18:00:00.000Z"))).toBe(12);
    expect(mexicoHour(new Date("2026-03-16T00:00:00.000Z"))).toBe(18);
    expect(mexicoHour(new Date("2026-03-16T01:00:00.000Z"))).toBe(19);
    expect(mexicoHour(new Date("2026-03-15T06:00:00.000Z"))).toBe(0);
  });
});

describe("firstName", () => {
  it("toma la primera palabra", () => {
    expect(firstName("Ana López")).toBe("Ana");
  });

  it("devuelve vacío si no hay nombre", () => {
    expect(firstName("")).toBe("");
    expect(firstName("   ")).toBe("");
  });
});
