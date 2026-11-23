import { expect, it } from "vitest";
import { isClusterSource, referralSources } from "@/content/referral-sources";

it("filtra fuentes en all, cluster y org", () => {
  const all = referralSources("all");
  const cluster = referralSources("cluster");
  const org = referralSources("org");

  expect(cluster.every((source) => isClusterSource(source.alt))).toBe(true);
  expect(org.every((source) => !isClusterSource(source.alt))).toBe(true);
  expect(cluster.length + org.length).toBe(all.length);
  expect(cluster.some((source) => source.alt === "Clúster de Startups e Innovación")).toBe(true);
  expect(org.some((source) => source.alt === "COPARMEX Puebla")).toBe(true);
});
