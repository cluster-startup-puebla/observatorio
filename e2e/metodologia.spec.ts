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
  await page.goto("/metodologia?persona=p-e2e&pregunta=1");
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

test("la metodología cierra sesión y no muestra el sitio ni el aviso", async ({ page }) => {
  await page.goto("/metodologia?persona=p-aviso");
  await expect(page.getByRole("button", { name: "Cerrar sesión" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Modo oscuro" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Observatorio" })).toHaveCount(0);
  await expect(page.getByTestId("aviso-confidencial")).toHaveCount(0);
});

test("guardar la primera pregunta abre la segunda", async ({ page }) => {
  await page.goto("/metodologia?persona=p-pasos");
  await expect(page.getByTestId("metodologia-lista")).toBeAttached();
  await page.getByRole("radio", { name: "Papel/Bitácoras" }).check();
  await expect(page.getByText("¿La información de producción se puede consultar sin pedirla a una persona?")).toBeVisible();
  await expect(page.getByTestId("seccion-actual")).toHaveText("Infraestructura y digitalización");
  await expect(page.getByTestId("progreso-preguntas")).toHaveText("1 de 18");
});
