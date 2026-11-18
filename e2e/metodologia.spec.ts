import { expect, test } from "@playwright/test";

test.beforeEach(async ({ request }) => {
  const response = await request.post("/test/reset");
  expect(response.ok()).toBeTruthy();
});

async function abrir(page: import("@playwright/test").Page) {
  await page.goto("/metodologia");
  const aviso = page.getByRole("button", { name: "Entiendo y empiezo" });
  if (await aviso.isVisible()) await aviso.click();
  const confirmar = page.getByRole("button", { name: "Confirmar" });
  const seguido = page.getByTestId("pregunta-v2").or(page.getByText("Este sector todavía no tiene diagnóstico"));
  await expect(confirmar.or(seguido)).toBeVisible();
  if ((await confirmar.isVisible()) && (await confirmar.isEnabled())) await confirmar.click();
}

async function empresario(page: import("@playwright/test").Page, sector: string) {
  await page.goto(`/crear-cuenta?sector=${sector}`);
  await page.getByLabel("Correo").fill(`desayuno-${sector}@norte.mx`);
  await page.getByLabel("Contraseña", { exact: true }).fill("secreto-largo");
  await page.getByRole("button", { name: "Crear cuenta" }).click();
  await page.getByRole("radio", { name: "11–50" }).check();
  await page.getByRole("button", { name: "Terminar perfil" }).click();
  await expect(page.getByTestId("qr-listo")).toBeVisible();
}

test("recargar conserva la pregunta y el tablero cuenta un empezado", async ({ browser }) => {
  const guest = await browser.newContext();
  const page = await guest.newPage();
  await empresario(page, "alimentos-y-bebidas");
  await abrir(page);
  const first = await page.getByTestId("pregunta-v2").textContent();
  await page.getByTestId("opcion-v2").first().click();
  await page.getByRole("button", { name: "Continuar" }).click();
  const second = await page.getByTestId("pregunta-v2").textContent();
  expect(second).not.toBe(first);
  await page.reload();
  await expect(page.getByTestId("pregunta-v2")).toHaveText(second ?? "");

  const runs = await page.request.get("/test/runs");
  expect(runs.ok()).toBeTruthy();
  const body = (await runs.json()) as { rows: { answers: Record<string, unknown>; finished_at: string | null }[] };
  expect(body.rows).toHaveLength(1);
  expect(body.rows[0].finished_at).toBeNull();
  expect(Object.keys(body.rows[0].answers).length).toBeGreaterThan(0);

  const admin = await browser.newContext();
  const panel = await admin.newPage();
  await panel.goto("/admin/signup");
  await panel.getByLabel("Correo").fill("mesa@admin.mx");
  await panel.getByLabel("Contraseña", { exact: true }).fill("secreto-largo");
  await panel.getByRole("button", { name: "Crear superadmin" }).click();
  await panel.goto("/admin/diagnosticos");
  await expect(panel.getByTestId("empezaron")).toHaveText("1");
  await expect(panel.getByTestId("acabaron")).toHaveText("0");
  await guest.close();
  await admin.close();
});

test("sin red se sigue contestando y no se abre otra fila", async ({ page }) => {
  await empresario(page, "alimentos-y-bebidas");
  await abrir(page);
  await page.getByTestId("opcion-v2").first().click();
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.context().setOffline(true);
  await page.getByTestId("opcion-v2").first().click();
  await page.getByRole("button", { name: "Continuar" }).click();
  await expect(page.getByText("Sin conexión. Tus respuestas siguen en este teléfono.")).toBeVisible();
  const localCount = await page.evaluate(() => {
    const key = Object.keys(localStorage).find((item) => item.startsWith("metodologia-v2:"));
    if (!key) return 0;
    return Object.keys(JSON.parse(localStorage.getItem(key) ?? "{}").answers ?? {}).length;
  });
  expect(localCount).toBeGreaterThan(1);
  await page.context().setOffline(false);
  const runs = await page.request.get("/test/runs");
  const body = (await runs.json()) as { rows: unknown[] };
  expect(body.rows).toHaveLength(1);
});

test("textil elige entre dos y minerales no abre preguntas", async ({ page, request }) => {
  await empresario(page, "textil-y-confeccion");
  await abrir(page);
  const sector = page.getByLabel("El diagnóstico");
  await expect(sector.locator("option", { hasText: "Hilados" })).toHaveCount(1);
  await expect(sector.locator("option", { hasText: "Confección" })).toHaveCount(1);
  expect((await request.post("/test/reset")).ok()).toBeTruthy();
  await empresario(page, "minerales-no-metalicos");
  await abrir(page);
  await expect(page.getByText("Este sector todavía no tiene diagnóstico")).toBeVisible();
  await expect(page.getByTestId("pregunta-v2")).toHaveCount(0);
});

test("la metodología cierra sesión y no muestra el sitio", async ({ page }) => {
  await empresario(page, "alimentos-y-bebidas");
  await page.goto("/metodologia");
  await expect(page.getByRole("button", { name: "Cerrar sesión" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Modo oscuro" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Observatorio" })).toHaveCount(0);
});
