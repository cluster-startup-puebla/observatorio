import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { peopleStats } from "./link-conversions";

describe("conversiones del home", () => {
  it("cuenta RSVPs confirmed atribuidos como registrados", () => {
    const stats = peopleStats([
      { slug: "turismo", status: "registrado", at: "2026-11-22T10:00:00.000Z" },
      { slug: "turismo", status: "registrado", at: "2026-11-23T10:00:00.000Z" },
      { slug: "plasticos-y-hule", status: "registrado", at: "2026-11-23T11:00:00.000Z" },
    ]);
    expect(stats.conversions).toBe(3);
    expect(stats.registrations.get("turismo")).toBe(2);
    expect(stats.moments).toHaveLength(3);
  });

  it("enlacePeople lee session_rsvps por organismo", () => {
    const source = readFileSync("src/lib/organismo/home-conversions.ts", "utf8");
    expect(source).toContain('from("session_rsvps")');
    expect(source).toContain("organization_id");
    expect(source).toContain('eq("status", "confirmed")');
  });
});