import { expect, test } from "@playwright/test";

test("la home publicada es la del observatorio", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.ok()).toBeTruthy();
  expect(response?.url()).toMatch(/^https:\/\/observatorio\.clusterdestartups\.org\/?$/);
  await expect(
    page.getByRole("heading", {
      name: "Lo que Puebla no sabe que necesita, tu empresa puede decirlo primero.",
    }),
  ).toBeVisible();
  await expect(page.getByTestId("bloque-evento")).toContainText("Quinta Real");
});

test("la ficha social apunta a este dominio", async ({ page }) => {
  await page.goto("/");
  const og = page.locator('meta[property="og:image"]');
  await expect(og).toHaveAttribute("content", /^https:\/\/observatorio\.clusterdestartups\.org\/og\.png/);
});

test("el logo del clúster y la imagen social cargan", async ({ request }) => {
  const logo = await request.get("/logos/logo-cluster.webp");
  const card = await request.get("/og.png");
  expect(logo.ok()).toBeTruthy();
  expect(logo.headers()["content-type"]).toContain("image/");
  expect(card.ok()).toBeTruthy();
});

test("un sector real queda seleccionado", async ({ page }) => {
  await page.goto("/automotriz-y-autopartes");
  await expect(page.getByTestId("sector-seleccionado")).toHaveText(
    "Empresa del sector Automotriz y autopartes.",
  );
});
