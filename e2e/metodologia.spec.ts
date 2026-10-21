import { expect, test } from "@playwright/test";

test.beforeEach(async ({ request }) => {
  const response = await request.post("/test/reset");
  expect(response.ok()).toBeTruthy();
});

test("la respuesta sobrevive al recargar y el panel la ve", async ({ browser }) => {
  const empresario = await browser.newContext();
  const page = await empresario.newPage();
  await page.goto("/metodologia?persona=p-e2e");
  await expect(page.getByTestId("metodologia-lista")).toBeAttached();
  await page.getByRole("radio", { name: "Papel/Bitácoras" }).check();
  await expect(page.getByText("Guardada")).toBeVisible();
  await page.reload();
  await expect(page.getByRole("radio", { name: "Papel/Bitácoras" })).toBeChecked();

  const admin = await browser.newContext();
  const panel = await admin.newPage();
  await panel.goto("/panel");
  await expect(panel.getByTestId("avance-p-e2e")).toContainText("1");
  await empresario.close();
  await admin.close();
});

test("al cerrar las 18 preguntas se descarga el diagnóstico", async ({ page }) => {
  await page.goto("/metodologia?persona=p-cierre&completas=1");
  await page.getByRole("button", { name: "Ver diagnóstico" }).click();
  await expect(page.getByTestId("nivel-integral")).toHaveText(/Bronce|Plata|Oro/);
  const download = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("link", { name: "Descargar diagnóstico" }).click(),
  ]).then(([file]) => file);
  expect(download.suggestedFilename()).toBe("diagnostico.txt");
});

test("sin persona el panel no inventa avance", async ({ page }) => {
  await page.goto("/panel");
  await expect(page.getByText("Todavía no hay respuestas.")).toBeVisible();
});
