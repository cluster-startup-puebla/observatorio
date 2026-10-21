import { expect, test } from "@playwright/test";

test("la home carga el título del observatorio", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", {
      name: "Lo que Puebla no sabe que necesita, tu empresa puede decirlo primero.",
    }),
  ).toBeVisible();
});
