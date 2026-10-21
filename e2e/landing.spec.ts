import { expect, test } from "@playwright/test";

test("la landing muestra la estructura y los sectores", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("bloque-objetivo")).toBeVisible();
  await expect(page.getByTestId("bloque-evento")).toContainText("Quinta Real");
  await expect(page.getByTestId("bloque-temas")).toBeVisible();
  await expect(page.getByTestId("bloque-via-partners")).toContainText("VIA Partners");
  await expect(page.getByTestId("sector-automotriz-y-autopartes")).toHaveAttribute(
    "href",
    "/automotriz-y-autopartes",
  );
});

test("la ruta de un sector lo deja seleccionado", async ({ page }) => {
  await page.goto("/automotriz-y-autopartes");
  await expect(page.getByTestId("sector-seleccionado")).toHaveText("Automotriz y autopartes");
  await expect(page.getByTestId("bloque-objetivo")).toBeVisible();
});

test("un sector desconocido no se selecciona", async ({ page }) => {
  await page.goto("/sector-inventado");
  await expect(page.getByTestId("sector-seleccionado")).toHaveCount(0);
});

test("un slug vacío de signos no se presenta como sector", async ({ page }) => {
  await page.goto("/%20%20");
  await expect(page.getByTestId("sector-seleccionado")).toHaveCount(0);
});
