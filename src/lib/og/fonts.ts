import { readFile } from "node:fs/promises";
import { join } from "node:path";

export async function ogFonts() {
  const dir = join(process.cwd(), "src/lib/og");
  const [display, text] = await Promise.all([
    readFile(join(dir, "archivo-800.woff")),
    readFile(join(dir, "raleway-500.woff")),
  ]);

  return [
    { name: "Archivo", data: display, weight: 800 as const, style: "normal" as const },
    { name: "Raleway", data: text, weight: 500 as const, style: "normal" as const },
  ];
}
