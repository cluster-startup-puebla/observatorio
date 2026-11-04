import { expect, test } from "@playwright/test";

const projectHost = "jnshenkmexsxiylpqhdh.supabase.co";

test("el JavaScript público no apunta a una base local", async ({ page, request }) => {
  await page.goto("/register");
  const srcs = await page.locator("script[src]").evaluateAll((nodes) =>
    nodes.map((node) => (node as HTMLScriptElement).src),
  );
  const bodies = await Promise.all(srcs.map(async (src) => (await request.get(src)).text()));
  const joined = bodies.join("\n");
  expect(joined).not.toContain(projectHost);
  expect(joined).not.toContain("127.0.0.1:54321");
  expect(joined).not.toContain("localhost:3000");
});

test("el proyecto de Supabase está en línea", async ({ request }) => {
  const health = await request.get(`https://${projectHost}/auth/v1/health`);
  expect(health.status()).toBe(401);
  expect(health.headers()["sb-project-ref"]).toBe("jnshenkmexsxiylpqhdh");
});
