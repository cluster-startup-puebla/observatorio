import { describe, expect, it } from "vitest";
import { eventIsOpen } from "./event-open";

// 09:00 in Mexico City (UTC-6, no DST) is 15:00 UTC.
const base = { sessionOn: "2026-11-10", startsLocal: "09:00", timeZone: "America/Mexico_City" };

describe("eventIsOpen", () => {
  it("is closed one minute before the zoned start", () => {
    expect(eventIsOpen({ ...base, now: new Date("2026-11-10T14:59:00Z") })).toBe(false);
  });

  it("is open exactly at the start", () => {
    expect(eventIsOpen({ ...base, now: new Date("2026-11-10T15:00:00Z") })).toBe(true);
  });

  it("is open the next calendar day, even earlier on the clock", () => {
    expect(eventIsOpen({ ...base, now: new Date("2026-11-11T07:00:00Z") })).toBe(true);
  });

  it("is closed the day before", () => {
    expect(eventIsOpen({ ...base, now: new Date("2026-11-09T23:00:00Z") })).toBe(false);
  });

  it("uses the session zone, not the server zone", () => {
    const tokyo = { ...base, timeZone: "Asia/Tokyo" };
    expect(eventIsOpen({ ...tokyo, now: new Date("2026-11-10T00:00:00Z") })).toBe(true);
    expect(eventIsOpen({ ...tokyo, now: new Date("2026-11-09T23:59:00Z") })).toBe(false);
  });

  it("falls back to America/Mexico_City for null or blank zones", () => {
    const before = new Date("2026-11-10T14:59:00Z");
    const at = new Date("2026-11-10T15:00:00Z");
    for (const timeZone of [null, "", "   "]) {
      expect(eventIsOpen({ ...base, timeZone, now: before })).toBe(false);
      expect(eventIsOpen({ ...base, timeZone, now: at })).toBe(true);
    }
  });

  it("accepts HH:MM:SS start times", () => {
    const input = { ...base, startsLocal: "09:00:30" };
    expect(eventIsOpen({ ...input, now: new Date("2026-11-10T15:00:29Z") })).toBe(false);
    expect(eventIsOpen({ ...input, now: new Date("2026-11-10T15:00:30Z") })).toBe(true);
  });

  it("handles midnight starts", () => {
    const input = { ...base, startsLocal: "00:00:00" };
    expect(eventIsOpen({ ...input, now: new Date("2026-11-10T05:59:00Z") })).toBe(false);
    expect(eventIsOpen({ ...input, now: new Date("2026-11-10T06:00:00Z") })).toBe(true);
  });
});
