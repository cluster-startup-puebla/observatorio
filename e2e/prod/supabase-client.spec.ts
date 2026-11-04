import { expect, test } from "@playwright/test";

const projectHost = "jnshenkmexsxiylpqhdh.supabase.co";

test("el JavaScript público apunta al Supabase de Levantamiento", async ({ page, request }) => {
  await page.goto("/register");
  const srcs = await page.locator("script[src]").evaluateAll((nodes) =>
    nodes.map((node) => (node as HTMLScriptElement).src),
  );
  const bodies = await Promise.all(srcs.map(async (src) => (await request.get(src)).text()));
  const joined = bodies.join("\n");
  expect(joined).toContain(projectHost);
  expect(joined).not.toContain("127.0.0.1:54321");
  expect(joined).not.toContain("localhost:3000");
});
