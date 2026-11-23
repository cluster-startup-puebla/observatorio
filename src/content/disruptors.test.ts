import { expect, it } from "vitest";
import { disruptorsReserveHref, disruptorsSlug } from "@/content/disruptors";
import { disruptorsSpeakers } from "@/content/disruptors-speakers";
import { sessionPublicSlug } from "@/lib/sessions/public-path";

it("el slug público de Disruptors cuadra con la fecha y el CTA va a registro", () => {
  expect(sessionPublicSlug("2026-11-28", "DISRUPTORS 2026")).toBe(disruptorsSlug);
  expect(disruptorsReserveHref).toBe("/registro");
  expect(disruptorsSpeakers).toHaveLength(10);
});
