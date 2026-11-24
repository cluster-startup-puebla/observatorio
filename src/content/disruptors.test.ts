import { existsSync } from "node:fs";
import path from "node:path";
import { expect, it } from "vitest";
import { disruptorsReserveHref, disruptorsSlug } from "@/content/disruptors";
import { debateModerator, debateTopics } from "@/content/disruptors-debate";
import { debateHumanPanelists } from "@/content/disruptors-debate-human";
import { debateTechPanelists } from "@/content/disruptors-debate-tech";
import { disruptorsSpeakers } from "@/content/disruptors-speakers";
import { sessionPublicSlug } from "@/lib/sessions/public-path";

it("el slug público de Disruptors cuadra con la fecha y el CTA va a registro", () => {
  expect(sessionPublicSlug("2026-11-28", "DISRUPTORS 2026")).toBe(disruptorsSlug);
  expect(disruptorsReserveHref).toBe("/registro");
  expect(disruptorsSpeakers).toHaveLength(10);
});

it("la mesa de debate tiene 6 panelistas, moderador, 6 temas y todas sus fotos locales", () => {
  const all = [...debateTechPanelists, ...debateHumanPanelists];
  expect(debateTechPanelists).toHaveLength(3);
  expect(debateHumanPanelists).toHaveLength(3);
  expect(debateTopics).toHaveLength(6);
  for (const photo of [debateModerator.photo, ...all.map((p) => p.photo)]) {
    expect(existsSync(path.join(process.cwd(), "public", photo))).toBe(true);
  }
});
