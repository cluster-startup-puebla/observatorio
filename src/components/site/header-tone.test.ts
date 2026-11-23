import { expect, it } from "vitest";
import { onProgramField } from "@/components/site/header-tone";

it("el campo oscuro de PxP vive en /v2, no en la portada", () => {
  expect(onProgramField("/")).toBe(false);
  expect(onProgramField("/v2")).toBe(true);
  expect(onProgramField("/sesiones")).toBe(false);
});
